
"use client";
import Link from "next/link";

import { type NavItem } from "~/types";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { useSidebar } from "~/hooks/useSidebar";
import { buttonVariants } from "~/components/ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/layout/subnav-accordion";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface SideNavProps {
  items: NavItem[];
  setOpen?: (open: boolean) => void;
  className?: string;
}

export function SideNav({ items, setOpen, className }: SideNavProps) {
  const path = usePathname();
  const { isOpen } = useSidebar();
  const [openItem, setOpenItem] = useState("");
  const [lastOpenItem, setLastOpenItem] = useState("");

  useEffect(() => {
    if (isOpen) {
      setOpenItem(lastOpenItem);
    } else {
      setLastOpenItem(openItem);
      setOpenItem("");
    }
  }, [isOpen]);

  return (
    <nav className="">
      {items.map((item) =>
        item.isChidren ? (
          <Accordion
            type="single"
            collapsible
            className=""
            key={item.title}
            value={openItem}
            onValueChange={setOpenItem}
          >
            <AccordionItem value={item.title} className="border-none ">
              <AccordionTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'group relative flex h-12 justify-between px-4 py-1  duration-200 hover:bg-muted hover:no-underline',
                )}
              >
                <div>
                  <item.icon className={cn('h-4 w-4', item.color)} />
                </div>
                <div
                  className={cn(
                    'absolute left-12  duration-200 ',
                    !isOpen && className,
                  )}
                >
                  {item.title}
                </div>

                {isOpen && (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                )}
              </AccordionTrigger>
              <AccordionContent className=" pb-1">
                {item.children?.map((child) => (
                  <Link
                    key={child.title}
                    href={child.href}
                    onClick={() => {
                      if (setOpen) setOpen(false)
                    }}
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      'ml-4 group relative flex h-12 justify-start gap-x-3',
                      path === child.href &&
                      'bg-muted font-bold hover:bg-muted',
                    )}
                  >
                    <child.icon className={cn('h-4 w-4', child.color)} />
                    <div
                      className={cn(
                        'absolute left-12  duration-200',
                        !isOpen && className,
                      )}
                    >
                      {child.title}
                    </div>
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <Link
            key={item.title}
            href={item.href}
            onClick={() => {
              if (setOpen) setOpen(false)
            }}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'group relative flex h-12 justify-start',
              path === item.href && 'bg-muted font-bold hover:bg-muted',
            )}
          >
            <item.icon className={cn('h-4 w-4', item.color)} />
            <span
              className={cn(
                'absolute left-12  duration-200',
                !isOpen && className,
              )}
            >
              {item.title}
            </span>
          </Link>
        ),
      )}
    </nav>
  );
}
