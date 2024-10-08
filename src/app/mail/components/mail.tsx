"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { AccountSwitcher } from "./account-switcher";
import SideBar from "./sidebar";
interface MailProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export const Mail: React.FC<MailProps> = ({
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
}) => {
  const [done, setDone] = useLocalStorage("imail-done", false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <TooltipProvider>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
            sizes,
          )}`;
        }}
        className="h-full min-h-screen items-stretch"
      >
        {/* Panel 1 */}
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={40}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true,
            )}`;
          }}
          onResize={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false,
            )}`;
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <div className="flex h-full flex-1 flex-col">
            <div
              className={cn(
                "flex h-[52px] items-center justify-center",
                isCollapsed ? "h-[52px]" : "px-2",
              )}
            >
              <AccountSwitcher isCollapsed={isCollapsed} />
            </div>
            <Separator />
            <SideBar isCollapsed={isCollapsed} />
            <div className="flex-1" />
            {/* Ask AI component */}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        {/* Panel 2 */}
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs
            defaultValue="inbox"
            value={done ? "done" : "inbox"}
            onValueChange={(tab) => {
              if (tab === "done") setDone(true);
              else setDone(false);
            }}
          >
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="inbox"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value="done"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Done
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            {/* SearchBar component */}
            <TabsContent value="inbox" className="m-0">
              {/* ThreadList */}
            </TabsContent>
            <TabsContent value="done" className="m-0">
              {/* ThreadList */}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        {/* Panel 3 */}
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          {/* ThreadDisplay */}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};
