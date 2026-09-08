import { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const SearchDropDown = ({ trigger }: { trigger: ReactNode }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent className="w-[400px] p-2">
        <div>Search result...</div>
      </PopoverContent>
    </Popover>
  );
};
