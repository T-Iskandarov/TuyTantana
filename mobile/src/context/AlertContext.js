import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import CustomAlertModal from '../components/CustomAlertModal';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [config, setConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onClose: null,
    onConfirm: null,
    confirmText: "Davom etish",
    cancelText: "Bekor qilish",
    closeText: "Tushundim"
  });

  const showAlert = (title, message, type = 'info', options = {}) => {
    setConfig({
      visible: true,
      title: title || 'Xabar',
      message: message || '',
      type,
      onClose: () => {
        setConfig(prev => ({ ...prev, visible: false }));
        if (options.onClose) options.onClose();
      },
      onConfirm: options.onConfirm || null,
      confirmText: options.confirmText || "Davom etish",
      cancelText: options.cancelText || "Bekor qilish",
      closeText: options.closeText || "Tushundim"
    });
  };

  // Automatically intercept native Alert.alert calls across the entire app
  useEffect(() => {
    const originalAlert = Alert.alert;
    
    Alert.alert = (title, message, buttons, options) => {
      let type = 'info';
      const titleLower = (title || '').toLowerCase();
      const msgLower = (message || '').toLowerCase();

      if (titleLower.includes('xato') || titleLower.includes('error') || msgLower.includes('xato') || msgLower.includes('olmaysiz')) {
        type = 'error';
      } else if (titleLower.includes('muvaffaqiyat') || titleLower.includes('rahmat') || titleLower.includes('success') || msgLower.includes('qo\'shildi') || msgLower.includes('saqlandi')) {
        type = 'success';
      } else if (titleLower.includes('ogohlantirish') || titleLower.includes('warning')) {
        type = 'warning';
      }

      if (Array.isArray(buttons) && buttons.length > 1) {
        type = 'confirm';
        const cancelBtn = buttons.find(b => b.style === 'cancel' || (b.text && b.text.toLowerCase().includes('yo\'q')) || (b.text && b.text.toLowerCase().includes('bekor')));
        const confirmBtn = buttons.find(b => b !== cancelBtn);

        showAlert(title, message, 'confirm', {
          onConfirm: () => {
            setConfig(prev => ({ ...prev, visible: false }));
            if (confirmBtn && confirmBtn.onPress) confirmBtn.onPress();
          },
          onClose: () => {
            setConfig(prev => ({ ...prev, visible: false }));
            if (cancelBtn && cancelBtn.onPress) cancelBtn.onPress();
          },
          confirmText: confirmBtn?.text || "Ha, davom etish",
          cancelText: cancelBtn?.text || "Bekor qilish"
        });
      } else {
        const singleBtn = Array.isArray(buttons) && buttons.length === 1 ? buttons[0] : null;
        showAlert(title, message, type, {
          onClose: () => {
            setConfig(prev => ({ ...prev, visible: false }));
            if (singleBtn && singleBtn.onPress) singleBtn.onPress();
          },
          closeText: singleBtn?.text || "Tushundim"
        });
      }
    };

    return () => {
      Alert.alert = originalAlert;
    };
  }, []);

  const handleClose = () => {
    if (config.onClose) {
      config.onClose();
    } else {
      setConfig(prev => ({ ...prev, visible: false }));
    }
  };

  const handleConfirm = () => {
    if (config.onConfirm) {
      config.onConfirm();
    } else {
      handleClose();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <CustomAlertModal
        visible={config.visible}
        title={config.title}
        message={config.message}
        type={config.type}
        onClose={handleClose}
        onConfirm={handleConfirm}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        closeText={config.closeText}
      />
    </AlertContext.Provider>
  );
};
