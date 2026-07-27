import os
import sys
import time
import threading
import telebot
from telebot import types

# Initialize Django environment via config
import config
from accounts.models import User
from bookings.models import Booking
from notifications.models import Notification
from services.models import Service

bot = telebot.TeleBot(config.TOKEN, parse_mode='Markdown')

# Dictionary to track admin states for broadcasting: { chat_id: { 'step': str, 'msg_id': int, 'from_chat_id': int } }
admin_states = {}

def get_user_by_chat(chat_id):
    return User.objects.filter(telegram_chat_id=str(chat_id)).first()

def is_admin(user):
    return user and (user.role == 'SUPERADMIN' or user.is_staff)

def get_main_keyboard(user):
    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
    btn_bookings = types.KeyboardButton("📋 Mening buyurtmalarim")
    btn_notifs = types.KeyboardButton("🔔 Bildirishnomalar")
    btn_about = types.KeyboardButton("ℹ️ Platforma haqida")
    btn_relink = types.KeyboardButton("🔄 Boshqa raqam ulash")
    markup.add(btn_bookings, btn_notifs, btn_about, btn_relink)
    if is_admin(user):
        markup.add(types.KeyboardButton("📢 Admin Panel"))
    return markup

def get_unlinked_keyboard():
    markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True, one_time_keyboard=True)
    btn_contact = types.KeyboardButton("📱 Telefon raqamni yuborish", request_contact=True)
    markup.add(btn_contact)
    return markup

@bot.message_handler(commands=['start'])
def handle_start(message):
    chat_id = message.chat.id
    user = get_user_by_chat(chat_id)
    
    if user:
        welcome_text = (
            f"Assalomu alaykum, *{user.name}*! 👋\n\n"
            f"Sizning *To'y Tantana* platformasidagi hisobingiz ushbu botga ulanib bo'lingan.\n\n"
            f"Barcha yangi buyurtmalar va bildirishnomalar avtomat ravishda ushbu botga tezkor xabar (Push Notification) tarzida kelib turadi."
        )
        bot.send_message(chat_id, welcome_text, reply_markup=get_main_keyboard(user))
    else:
        welcome_text = (
            "Assalomu alaykum! 🎉 *To'y Tantana* platformasining rasmiy bildirishnoma va yordamchi botiga xush kelibsiz.\n\n"
            "Botdan foydalanish va platformadan keluvchi buyurtma xabarlarini tezkor qabul qilib turish uchun hisobingizni ulashingiz zarur.\n\n"
            "Iltimos, pastdagi **«📱 Telefon raqamni yuborish»** tugmasini bosing:"
        )
        bot.send_message(chat_id, welcome_text, reply_markup=get_unlinked_keyboard())

@bot.message_handler(content_types=['contact'])
def handle_contact(message):
    chat_id = message.chat.id
    if not message.contact or not message.contact.phone_number:
        bot.send_message(chat_id, "⚠️ Iltimos, telefon raqamingizni pastdagi maxsus tugma orqali yuboring.", reply_markup=get_unlinked_keyboard())
        return
        
    raw_phone = message.contact.phone_number
    digits = "".join(filter(str.isdigit, raw_phone))
    
    # Search in Django DB by matching phone digits
    user = None
    for pattern in [f"+{digits}", digits, f"+998{digits[-9:]}", digits[-9:]]:
        user = User.objects.filter(phone_number__endswith=pattern[-9:]).first()
        if user:
            break
            
    if user:
        # Check if another user already linked this chat_id or clear old links
        old_linked = User.objects.filter(telegram_chat_id=str(chat_id)).exclude(id=user.id)
        for old_u in old_linked:
            old_u.telegram_chat_id = None
            old_u.save()
            
        user.telegram_chat_id = str(chat_id)
        user.save()
        
        success_text = (
            f"✅ *Hisobingiz muvaffaqiyatli ulandi!*\n\n"
            f"👤 *Foydalanuvchi:* {user.name}\n"
            f"📱 *Telefon:* {user.phone_number}\n"
            f"🛡️ *Rol:* {user.get_role_display()}\n\n"
            f"Endi platforma orqali amalga oshiriladigan barcha harakatlar (buyurtma qabul qilingani, bekor bo'lgani yoki yangi mijozlar bron qilgani) haqida tezkor xabar olib turasiz! 🔔"
        )
        bot.send_message(chat_id, success_text, reply_markup=get_main_keyboard(user))
    else:
        err_text = (
            f"⚠️ *Hisob topilmadi!*\n\n"
            f"Siz yuborgan raqam (`{raw_phone}`) bo'yicha To'y Tantana platformasida ro'yxatdan o'tgan foydalanuvchi topilmadi.\n\n"
            f"Iltimos, avval mobil ilova yoki veb-sayt orqali ro'yxatdan o'ting va so'ngra botga qayta urinib ko'ring."
        )
        bot.send_message(chat_id, err_text, reply_markup=get_unlinked_keyboard())

@bot.message_handler(func=lambda m: m.text == "📋 Mening buyurtmalarim")
def handle_my_bookings(message):
    chat_id = message.chat.id
    user = get_user_by_chat(chat_id)
    if not user:
        bot.send_message(chat_id, "⚠️ Hisobingiz ulanmagan. Iltimos, /start buyrug'i orqali telefon raqamingizni yuboring.", reply_markup=get_unlinked_keyboard())
        return
        
    if user.role == 'PROVIDER':
        bookings = Booking.objects.filter(service__provider=user).select_related('service', 'user').order_by('-date')[:5]
        role_label = "Sizning xizmatlaringizga tushgan so'nggi 5 ta buyurtma"
    else:
        bookings = Booking.objects.filter(user=user).select_related('service').order_by('-date')[:5]
        role_label = "Sizning so'nggi 5 ta buyurtmangiz"
        
    if not bookings:
        bot.send_message(chat_id, f"📋 *Mening buyurtmalarim*\n\n{role_label}:\n\nHozircha hecham buyurtmalar mavjud emas.")
        return
        
    res_text = f"📋 *Mening buyurtmalarim* ({role_label}):\n\n"
    for b in bookings:
        status_icon = "⏳" if b.status == 'PENDING' else ("✅" if b.status == 'CONFIRMED' else "❌")
        status_name = "Kutilmoqda" if b.status == 'PENDING' else ("Tasdiqlangan" if b.status == 'CONFIRMED' else "Bekor qilingan")
        date_str = b.date.strftime("%d.%m.%Y")
        
        if user.role == 'PROVIDER':
            client_name = getattr(b.user, 'name', 'Mijoz') if b.user else "Mijoz"
            client_phone = getattr(b.user, 'phone_number', '') if b.user else ""
            res_text += f"▪️ *{b.service.name}*\n📅 Sana: `{date_str}` | {status_icon} *{status_name}*\n👤 Mijoz: {client_name} ({client_phone})\n\n"
        else:
            res_text += f"▪️ *{b.service.name}*\n📅 Sana: `{date_str}` | {status_icon} *{status_name}*\n\n"
            
    bot.send_message(chat_id, res_text)

@bot.message_handler(func=lambda m: m.text == "🔔 Bildirishnomalar")
def handle_my_notifications(message):
    chat_id = message.chat.id
    user = get_user_by_chat(chat_id)
    if not user:
        bot.send_message(chat_id, "⚠️ Hisobingiz ulanmagan. Iltimos, /start buyrug'i orqali raqam yuboring.", reply_markup=get_unlinked_keyboard())
        return
        
    notifs = Notification.objects.filter(user=user).order_by('-created_at')[:5]
    if not notifs:
        bot.send_message(chat_id, "🔔 *Bildirishnomalar*\n\nSizda hozircha hech qanday bildirishnomalar mavjud emas.")
        return
        
    res_text = "🔔 *So'nggi 5 ta bildirishnomangiz:*\n\n"
    for n in notifs:
        dt_str = n.created_at.strftime("%d.%m.%Y %H:%M")
        res_text += f"▫️ *{n.title}* (__{dt_str}__)\n{n.message}\n\n"
        
    bot.send_message(chat_id, res_text)

@bot.message_handler(func=lambda m: m.text == "ℹ️ Platforma haqida")
def handle_about(message):
    about_text = (
        "🌟 *To'y Tantana Platformasi*\n\n"
        "O'zbekistondagi eng zamonaviy to'y va marosim xizmatlarini izlash, bron qilish va boshqarish platformasi.\n\n"
        "▫️ Barcha to'yxonalar, san'atkorlar, foto/video ustalari va salonlar bir joyda.\n"
        "▫️ Shaffof baholar va haqiqiy mijozlar izohlari.\n"
        "▫️ Tezkor va ishonchli onlayn bron qilish tizimi.\n\n"
        "🌐 *Rasmiy veb-sayt va ilovani yuklab olish:* www.tuy-tantana.uz"
    )
    bot.send_message(message.chat.id, about_text)

@bot.message_handler(func=lambda m: m.text == "🔄 Boshqa raqam ulash")
def handle_relink(message):
    chat_id = message.chat.id
    user = get_user_by_chat(chat_id)
    if user:
        user.telegram_chat_id = None
        user.save()
    bot.send_message(
        chat_id, 
        "🔄 Eski hisobingiz botdan uzildi. Boshqa telefon raqamingizni ulash uchun pastdagi tugmani bosing:", 
        reply_markup=get_unlinked_keyboard()
    )

# --- ADMIN PANEL & BROADCAST FUNCTIONALITY ---

def get_admin_inline_markup():
    markup = types.InlineKeyboardMarkup(row_width=1)
    btn_broadcast = types.InlineKeyboardButton("📢 Reklama / Xabar yuborish (Broadcast)", callback_data="admin_broadcast_start")
    btn_refresh = types.InlineKeyboardButton("🔄 Statistikani yangilash", callback_data="admin_refresh")
    markup.add(btn_broadcast, btn_refresh)
    return markup

def get_admin_stats_text():
    total_users = User.objects.count()
    bot_users = User.objects.filter(telegram_chat_id__isnull=False).exclude(telegram_chat_id='').count()
    total_services = Service.objects.count()
    total_bookings = Booking.objects.count()
    
    return (
        "👑 *To'y Tantana — Admin Panel*\n\n"
        "📊 *Platforma bo'yicha joriy statistika:*\n\n"
        f"👥 Jami ro'yxatdan o'tganlar: `{total_users}` ta\n"
        f"🤖 Telegram botga ulanganlar: `{bot_users}` ta\n"
        f"🎉 Jami faol xizmatlar: `{total_services}` ta\n"
        f"📅 Jami bronlar (buyurtmalar): `{total_bookings}` ta\n\n"
        "📢 *Reklama va habarlar:* Pastdagi tugma orqali botga ulangan barcha foydalanuvchilarga reklama yoki e'lon yuborishingiz mumkin."
    )

@bot.message_handler(commands=['admin'])
@bot.message_handler(func=lambda m: m.text == "📢 Admin Panel")
def handle_admin_panel(message):
    chat_id = message.chat.id
    user = get_user_by_chat(chat_id)
    
    if not is_admin(user):
        bot.send_message(chat_id, "❌ Ushbu bo'lim faqat platforma ma'murlari (Adminlar) uchun ruxsat etilgan.")
        return
        
    bot.send_message(chat_id, get_admin_stats_text(), reply_markup=get_admin_inline_markup())

@bot.callback_query_handler(func=lambda call: call.data.startswith("admin_"))
def handle_admin_callbacks(call):
    chat_id = call.message.chat.id
    user = get_user_by_chat(chat_id)
    if not is_admin(user):
        bot.answer_callback_query(call.id, "❌ Ruxsat yo'q")
        return
        
    if call.data == "admin_refresh":
        bot.answer_callback_query(call.id, "🔄 Statistika yangilandi")
        try:
            bot.edit_message_text(
                chat_id=chat_id,
                message_id=call.message.message_id,
                text=get_admin_stats_text(),
                reply_markup=get_admin_inline_markup(),
                parse_mode="Markdown"
            )
        except Exception:
            pass
            
    elif call.data == "admin_broadcast_start":
        bot.answer_callback_query(call.id)
        admin_states[chat_id] = {'step': 'waiting_broadcast'}
        
        cancel_markup = types.InlineKeyboardMarkup()
        cancel_markup.add(types.InlineKeyboardButton("❌ Bekor qilish", callback_data="admin_broadcast_cancel"))
        
        prompt_text = (
            "📢 *Reklama yoki Xabar yuborish (Broadcast)*\n\n"
            "Botga ulangan barcha foydalanuvchilarga yubormoqchi bo'lgan xabaringizni yuboring.\n\n"
            "💡 *Dastur barcha formatlarni qo'llab-quvvatlaydi:* Oddiy matn, Rasm (izohi bilan), Video, sticker yoki audio.\n\n"
            "👉 _Hozir yuboring yoki bekor qiling:_"
        )
        bot.send_message(chat_id, prompt_text, reply_markup=cancel_markup)
        
    elif call.data == "admin_broadcast_cancel":
        bot.answer_callback_query(call.id, "❌ Bekor qilindi")
        if chat_id in admin_states:
            del admin_states[chat_id]
        bot.send_message(chat_id, "📢 Reklama yuborish bekor qilindi.", reply_markup=get_main_keyboard(user))
        
    elif call.data == "admin_broadcast_confirm":
        bot.answer_callback_query(call.id, "🚀 Yuborish boshlandi...")
        state = admin_states.get(chat_id)
        if not state or state.get('step') != 'confirm_broadcast':
            bot.send_message(chat_id, "⚠️ Xabar holati eskirgan. Iltimos, /admin orqali qaytadan urinib ko'ring.")
            return
            
        msg_id = state['msg_id']
        from_chat_id = state['from_chat_id']
        del admin_states[chat_id]
        
        target_users = list(User.objects.filter(telegram_chat_id__isnull=False).exclude(telegram_chat_id=''))
        total_targets = len(target_users)
        
        status_msg = bot.send_message(chat_id, f"⏳ *Reklama yuborish boshlandi...*\n\nJami qabul qiluvchilar: `{total_targets}` ta foydalanuvchi.\nJarayon davom etmoqda...")
        
        def _run_broadcast():
            success = 0
            fail = 0
            for idx, u in enumerate(target_users):
                try:
                    bot.copy_message(
                        chat_id=int(u.telegram_chat_id),
                        from_chat_id=from_chat_id,
                        message_id=msg_id
                    )
                    success += 1
                except Exception as e:
                    fail += 1
                    
                # Small pause to respect Telegram rate limits (approx 20-30 msgs per sec max)
                time.sleep(0.05)
                
            report_text = (
                "🏁 *Reklama yuborish muvaffaqiyatli yakunlandi!*\n\n"
                f"👥 Jami yo'naltirildi: `{total_targets}` ta\n"
                f"✅ Muvaffaqiyatli yetib bordi: `{success}` ta\n"
                f"⚠️ Yuborilmadi (botni bloklagan yoki o'chirib yuborganlar): `{fail}` ta"
            )
            try:
                bot.edit_message_text(
                    chat_id=chat_id,
                    message_id=status_msg.message_id,
                    text=report_text,
                    parse_mode="Markdown"
                )
            except Exception:
                bot.send_message(chat_id, report_text)
                
        threading.Thread(target=_run_broadcast, daemon=True).start()

@bot.message_handler(func=lambda message: message.chat.id in admin_states and admin_states[message.chat.id].get('step') == 'waiting_broadcast', content_types=['text', 'photo', 'video', 'document', 'audio', 'voice', 'animation', 'sticker'])
def handle_broadcast_preview(message):
    chat_id = message.chat.id
    user = get_user_by_chat(chat_id)
    if not is_admin(user):
        return
        
    admin_states[chat_id] = {
        'step': 'confirm_broadcast',
        'msg_id': message.message_id,
        'from_chat_id': chat_id
    }
    
    target_count = User.objects.filter(telegram_chat_id__isnull=False).exclude(telegram_chat_id='').count()
    
    bot.send_message(chat_id, "👇 **Quyida xabar ko'rinishi (prevyu):**")
    try:
        bot.copy_message(chat_id=chat_id, from_chat_id=chat_id, message_id=message.message_id)
    except Exception:
        pass
        
    confirm_markup = types.InlineKeyboardMarkup(row_width=2)
    btn_yes = types.InlineKeyboardButton(f"✅ Tasdiqlash ({target_count} kishiga)", callback_data="admin_broadcast_confirm")
    btn_no = types.InlineKeyboardButton("❌ Bekor qilish", callback_data="admin_broadcast_cancel")
    confirm_markup.add(btn_yes, btn_no)
    
    bot.send_message(
        chat_id, 
        f"❓ *Aynan ushbu xabarni* botga ulangan jami **{target_count} ta** foydalanuvchiga yuborishni tasdiqlaysizmi?", 
        reply_markup=confirm_markup
    )

# Fallback echo / instruction for unknown text messages
@bot.message_handler(func=lambda message: True)
def handle_other_messages(message):
    chat_id = message.chat.id
    user = get_user_by_chat(chat_id)
    if not user:
        bot.send_message(chat_id, "⚠️ Iltimos, avval hisobingizni ulash uchun pastdagi tugmani bosib telefon raqamingizni yuboring:", reply_markup=get_unlinked_keyboard())
    else:
        bot.send_message(chat_id, "💡 Iltimos, pastdagi asosiy menyu tugmalaridan birini tanlang yoki buyurtmalar haqida xabarni kuting.", reply_markup=get_main_keyboard(user))

if __name__ == '__main__':
    print(f"Starting Telegram Bot ({config.BOT_USERNAME})...")
    bot.infinity_polling(timeout=20, long_polling_timeout=15)
