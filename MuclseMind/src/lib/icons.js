/**
 * Centralized icons module
 * This file exports all icons used in the application from both
 * Ant Design Icons and Lucide React libraries
 */

// Ant Design Icons
import {
  DownloadOutlined,
  FilterOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  MenuOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  PrinterOutlined
} from '@ant-design/icons';

// Lucide React Icons
import {
  Stethoscope,
  Download,
  FilePlus,
  FileText,
  Printer,
  Calendar,
  User,
  Clock,
  Settings,
  Pill,
  ClipboardList,
  UserPlus
} from 'lucide-react';

// Export all icons grouped by their usage
export const formIcons = {
  User,
  UserPlus,
  Calendar,
  Clock,
  Pill,
  ClipboardList
};

export const actionIcons = {
  Download,
  DownloadOutlined,
  PrinterOutlined,
  Printer,
  Settings
};

export const navigationIcons = {
  MenuOutlined,
  SearchOutlined
};

export const medicalIcons = {
  Stethoscope,
  MedicineBoxOutlined
};

export const documentIcons = {
  FileText,
  FileTextOutlined,
  FilePlus
};

// Also export individual icons for direct usage
export {
  // Ant Design Icons
  DownloadOutlined,
  FilterOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  MenuOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  PrinterOutlined,
  
  // Lucide Icons
  Stethoscope,
  Download,
  FilePlus,
  FileText,
  Printer,
  Calendar,
  User,
  Clock,
  Settings,
  Pill,
  ClipboardList,
  UserPlus
};
