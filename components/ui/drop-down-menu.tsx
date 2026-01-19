import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/animate-ui/radix/dropdown-menu';
import { TextAlignEnd } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RadixDropdownMenuRadioDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export function DropdownMenuComponent({
  side,
  sideOffset,
  align,
  alignOffset,
}: RadixDropdownMenuRadioDemoProps) {
  const [position, setPosition] = React.useState('bottom');
  const {logout} = useAuth()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className='bg-transparent'><TextAlignEnd className='text-[#201f20] dark:text-[#81e994]' size={40} /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top">View Profile</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Settings</DropdownMenuRadioItem>
          <DropdownMenuRadioItem onClick={logout} value="right" className='text-[#f30202]'>Logout</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}