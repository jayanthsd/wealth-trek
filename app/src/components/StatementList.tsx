"use client";

import { StatementEntry } from "@/types";
import { computeEffectiveValue } from "@/lib/computations";
import { formatINR } from "@/lib/computations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface StatementListProps {
  statements: StatementEntry[];
  onEdit: (entry: StatementEntry) => void;
  onDelete: (id: string) => void;
}

export function StatementList({ statements, onEdit, onDelete }: StatementListProps) {
  const assets = statements.filter((s) => s.category === "asset");
  const liabilities = statements.filter((s) => s.category === "liability");

  function renderTable(entries: StatementEntry[], title: string, isAsset: boolean) {
    const Icon = isAsset ? TrendingUp : TrendingDown;
    const iconBgColor = isAsset ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600";
    const valueColor = isAsset ? "text-emerald-600" : "text-rose-600";
    
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBgColor}`}>
              <Icon className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold">
              {title}
              {entries.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-sm font-normal text-muted-foreground">
                  {entries.length}
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No {title.toLowerCase()} added yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first {isAsset ? "asset" : "liability"} using the form above</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-12 font-semibold">S.No</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="text-right font-semibold">Closing Balance</TableHead>
                    <TableHead className="text-right font-semibold">Ownership %</TableHead>
                    <TableHead className="text-right font-semibold">Effective Value</TableHead>
                    <TableHead className="w-24 text-center font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, index) => (
                    <TableRow key={entry.id} className="group">
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{entry.statementType}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.description || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatINR(entry.closingBalance)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {entry.ownershipPercentage}%
                      </TableCell>
                      <TableCell className={`text-right font-semibold tabular-nums ${valueColor}`}>
                        {formatINR(computeEffectiveValue(entry))}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => onEdit(entry)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete(entry.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {renderTable(assets, "Assets", true)}
      {renderTable(liabilities, "Liabilities", false)}
    </div>
  );
}
