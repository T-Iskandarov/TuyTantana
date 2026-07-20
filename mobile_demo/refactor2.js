const fs = require('fs');

const replaceInFile = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace import
  content = content.replace(/import \{ Ionicons \} from '@expo\/vector-icons';/, 
    "import { Heart, WarningCircle, Lock, Eye, EyeSlash, ArrowRight, UserCircle, Briefcase, SignOut, User, Phone, Calendar, X, Check, FolderOpen, Trash, UserPlus, CheckCircle, ArrowLeft } from 'phosphor-react-native';");

  // LoginScreen / RegisterScreen
  content = content.replace(/<Ionicons\s+name="heart".*?\/>/g, '<Heart size={36} color={COLORS.primary} weight="fill" />');
  content = content.replace(/<Ionicons\s+name="alert-circle".*?\/>/g, '<WarningCircle size={18} color={COLORS.danger} weight="fill" />');
  content = content.replace(/<Ionicons[\s\S]*?name="lock-closed-outline"[\s\S]*?\/>/g, '<Lock size={20} color={COLORS.textLight} style={styles.inputIcon} />');
  content = content.replace(/<Ionicons[\s\S]*?name=\{showPassword \? 'eye-off-outline' : 'eye-outline'\}[\s\S]*?\/>/g, '{showPassword ? <EyeSlash size={20} color={COLORS.textLight} /> : <Eye size={20} color={COLORS.textLight} />}');
  content = content.replace(/<Ionicons[\s\S]*?name="arrow-forward"[\s\S]*?\/>/g, '<ArrowRight size={20} color={COLORS.white} />');
  
  // Register specific
  content = content.replace(/<Ionicons[\s\S]*?name="arrow-back"[\s\S]*?\/>/g, '<ArrowLeft size={22} color={COLORS.white} />');
  content = content.replace(/<Ionicons[\s\S]*?name="person-add"[\s\S]*?\/>/g, '<UserPlus size={30} color={COLORS.primary} />');
  content = content.replace(/<Ionicons[\s\S]*?name="person-outline"[\s\S]*?\/>/g, '<User size={20} color={COLORS.textLight} style={styles.inputIcon} />');
  content = content.replace(/<Ionicons[\s\S]*?name="call-outline"[\s\S]*?\/>/g, '<Phone size={20} color={COLORS.textLight} style={styles.inputIcon} />');
  content = content.replace(/<Ionicons[\s\S]*?name="checkmark-circle"[\s\S]*?\/>/g, '<CheckCircle size={20} color={COLORS.white} weight="fill" />');

  // ProfileScreen
  content = content.replace(/<Ionicons\s+name="person-circle-outline".*?\/>/g, '<UserCircle size={80} color={COLORS.textLight} weight="light" />');
  content = content.replace(/<Ionicons\s+name="briefcase-outline".*?\/>/g, '<Briefcase size={20} color={COLORS.primary} />');
  content = content.replace(/<Ionicons\s+name="chevron-forward".*?\/>/g, '<ArrowRight size={20} color={COLORS.textLight} />');
  content = content.replace(/<Ionicons\s+name="log-out-outline".*?\/>/g, '<SignOut size={20} color={COLORS.danger} />');

  // ProviderDashboard
  content = content.replace(/<Ionicons\s+name="person-outline".*?size=\{14\}.*?\/>/g, '<User size={14} color={COLORS.textSecondary} />');
  content = content.replace(/<Ionicons\s+name="call-outline".*?size=\{14\}.*?\/>/g, '<Phone size={14} color={COLORS.textSecondary} />');
  content = content.replace(/<Ionicons\s+name="calendar-outline".*?size=\{14\}.*?\/>/g, '<Calendar size={14} color={COLORS.textSecondary} />');
  content = content.replace(/<Ionicons\s+name="close".*?\/>/g, '<X size={18} color={COLORS.danger} weight="bold" />');
  content = content.replace(/<Ionicons\s+name="checkmark".*?\/>/g, '<Check size={18} color={COLORS.success} weight="bold" />');
  content = content.replace(/<Ionicons\s+name="folder-open-outline".*?\/>/g, '<FolderOpen size={48} color={COLORS.textLight} />');

  // ProviderServices
  content = content.replace(/<Ionicons\s+name="trash-outline".*?\/>/g, '<Trash size={18} color={COLORS.danger} />');
  content = content.replace(/<Ionicons\s+name="briefcase-outline".*?size=\{48\}.*?\/>/g, '<Briefcase size={48} color={COLORS.textLight} />');

  fs.writeFileSync(file, content);
};

['LoginScreen.js', 'RegisterScreen.js', 'ProfileScreen.js', 'ProviderDashboardScreen.js', 'ProviderServicesScreen.js'].forEach(f => {
  replaceInFile('c:/Users/T_Iskandarov/Desktop/tuy-tantana/mobile/src/screens/' + f);
});

console.log("Done");
