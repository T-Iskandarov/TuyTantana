const fs = require('fs');

const replaceInFile = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Imports
  content = content.replace(/import \{ Ionicons \} from '@expo\/vector-icons';/, 
    "import { ArrowLeft, Star, CaretLeft, CaretRight, Calendar, Lock, WarningCircle, ArrowsClockwise, MapPin, Users, CheckCircle, User, Phone, CalendarBlank, Chats, ChatCircleDots, PaperPlaneRight } from 'phosphor-react-native';\nimport { getPhosphorIcon } from '../lib/icons';");

  // Icons
  content = content.replace(/<Ionicons name="arrow-back".*?\/>/g, '<ArrowLeft size={24} color={COLORS.white} weight="bold" />');

  // Stars
  content = content.replace(/<Ionicons\s+key=\{star\}\s+name=\{star <= rating \? 'star' : 'star-outline'\}\s+size=\{size\}\s+color=\{color\}\s+style=\{\{ marginRight: 2 \}\}\s+\/>/g, 
    '<Star key={star} size={size} color={star <= rating ? color : "#E5E7EB"} weight={star <= rating ? "fill" : "regular"} style={{ marginRight: 2 }} />');

  content = content.replace(/<Ionicons\s+name=\{star <= rating \? 'star' : 'star-outline'\}\s+size=\{size\}\s+color="#F59E0B"\s+style=\{\{ marginRight: 6 \}\}\s+\/>/g,
    '<Star size={size} color={star <= rating ? "#F59E0B" : "#E5E7EB"} weight={star <= rating ? "fill" : "regular"} style={{ marginRight: 6 }} />');
    
  content = content.replace(/<Ionicons name="star" size=\{14\} color="#F59E0B" \/>/g, '<Star size={14} color="#F59E0B" weight="fill" />');

  content = content.replace(/<Ionicons name="chevron-back".*?\/>/g, '<CaretLeft size={22} color={COLORS.primary} weight="bold" />');
  content = content.replace(/<Ionicons name="chevron-forward".*?\/>/g, '<CaretRight size={22} color={COLORS.primary} weight="bold" />');
  content = content.replace(/<Ionicons name="calendar-outline".*?\/>/g, '<Calendar size={20} color={COLORS.white} />');
  content = content.replace(/<Ionicons name="lock-closed-outline".*?\/>/g, '<Lock size={18} color={COLORS.primary} />');
  content = content.replace(/<Ionicons name="alert-circle-outline".*?\/>/g, '<WarningCircle size={56} color={COLORS.danger} />');
  content = content.replace(/<Ionicons name="refresh-outline".*?\/>/g, '<ArrowsClockwise size={20} color={COLORS.white} style={{ marginRight: 6 }} />');
  
  // typeInfo.icon
  content = content.replace(/<Text style=\{styles.placeholderEmoji\}>\{typeInfo.icon\}<\/Text>/g, '<View style={{alignItems: "center", justifyContent: "center"}}>{getPhosphorIcon(service.type, false, 64)}</View>');
  content = content.replace(/<Text style=\{styles.typeBadgeEmoji\}>\{typeInfo.icon\}<\/Text>/g, '<View style={{marginRight: 6}}>{getPhosphorIcon(service.type, true, 16)}</View>');
  
  content = content.replace(/<Ionicons name="location-outline".*?\/>/g, '<MapPin size={18} color={COLORS.primary} />');
  content = content.replace(/<Ionicons name="people-outline".*?\/>/g, '<Users size={18} color={COLORS.primary} />');
  content = content.replace(/<Ionicons name="checkmark-circle".*?\/>/g, '<CheckCircle size={14} color={COLORS.success} weight="fill" style={{ marginRight: 4 }} />');
  content = content.replace(/<Ionicons name="person".*?\/>/g, '<User size={22} color={COLORS.primary} />');
  content = content.replace(/<Ionicons name="call-outline".*?\/>/g, '<Phone size={18} color={COLORS.primary} />');
  content = content.replace(/<Ionicons name="calendar".*?\/>/g, '<CalendarBlank size={22} color={COLORS.primary} weight="fill" />');
  content = content.replace(/<Ionicons name="chatbubbles".*?\/>/g, '<Chats size={22} color={COLORS.primary} weight="fill" />');
  content = content.replace(/<Ionicons name="chatbubble-ellipses-outline".*?\/>/g, '<ChatCircleDots size={40} color={COLORS.textLight} />');
  content = content.replace(/<Ionicons name="send".*?\/>/g, '<PaperPlaneRight size={18} color={COLORS.white} weight="fill" style={{ marginRight: 8 }} />');

  fs.writeFileSync(file, content);
};

replaceInFile('c:/Users/T_Iskandarov/Desktop/tuy-tantana/mobile/src/screens/ServiceDetailScreen.js');

const replaceInProvider = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/import \{ Ionicons \} from '@expo\/vector-icons';/, 
    "import { Plus, CaretRight, Star, ArrowLeft } from 'phosphor-react-native';\nimport { getPhosphorIcon } from '../lib/icons';");

  content = content.replace(/<Ionicons name="add".*?\/>/g, '<Plus size={24} color={COLORS.white} weight="bold" />');
  content = content.replace(/<Ionicons name="chevron-forward".*?\/>/g, '<CaretRight size={20} color={COLORS.textLight} weight="bold" />');
  content = content.replace(/<Ionicons name="star".*?\/>/g, '<Star size={14} color="#FFB800" weight="fill" />');
  content = content.replace(/<Ionicons name="arrow-back".*?\/>/g, '<ArrowLeft size={24} color={COLORS.text} weight="bold" />');

  content = content.replace(/<Text style=\{\{ fontSize: 32 \}\}>\{typeInfo.icon\}<\/Text>/g, '{getPhosphorIcon(item.type, false, 32)}');
  content = content.replace(/<Text style=\{styles.badgeText\}>\{typeInfo.icon\} \{typeInfo.label\}<\/Text>/g, '<View style={{flexDirection: "row", alignItems: "center", gap: 4}}>{getPhosphorIcon(item.type, true, 12)}<Text style={styles.badgeText}>{typeInfo.label}</Text></View>');

  fs.writeFileSync(file, content);
};

replaceInProvider('c:/Users/T_Iskandarov/Desktop/tuy-tantana/mobile/src/screens/ProviderServicesScreen.js');

console.log("Done");
