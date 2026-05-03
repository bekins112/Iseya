import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, FileJson } from "lucide-react";
import { exportData, type ExportFormat } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";

interface ExportColumn {
  key: string;
  label: string;
  transform?: (val: any, row: Record<string, any>) => string;
}

interface ExportButtonProps {
  data: Record<string, any>[];
  columns: ExportColumn[];
  filename: string;
  totalLabel?: string;
}

export function ExportButton({ data, columns, filename, totalLabel }: ExportButtonProps) {
  const { toast } = useToast();

  const handleExport = (format: ExportFormat) => {
    if (data.length === 0) {
      toast({ title: "No data to export", description: "There are no records matching your current filters.", variant: "destructive" });
      return;
    }
    exportData(data, columns, filename, format);
    toast({ title: "Export complete", description: `${data.length} ${totalLabel || "records"} exported as ${format.toUpperCase()}.` });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-testid={`button-export-${filename}`}>
          <Download className="w-4 h-4 mr-2" />
          Export ({data.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("xlsx")} data-testid={`button-export-${filename}-excel`}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Excel (.xls)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")} data-testid={`button-export-${filename}-csv`}>
          <FileText className="w-4 h-4 mr-2" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")} data-testid={`button-export-${filename}-json`}>
          <FileJson className="w-4 h-4 mr-2" />
          JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
