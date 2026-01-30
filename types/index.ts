import { IconType } from "react-icons";

export interface Category {
  id?: string;
  label: string;
  icon: IconType;
  description?: string;
}
