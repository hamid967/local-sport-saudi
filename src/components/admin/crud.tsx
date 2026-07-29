import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type FieldBase = { name: string; label: string; required?: boolean; hideInList?: boolean };
export type Field =
  | (FieldBase & { type: "text" | "textarea" | "date" | "datetime-local" | "time" | "url" })
  | (FieldBase & { type: "number"; step?: string })
  | (FieldBase & { type: "boolean" })
  | (FieldBase & { type: "select"; options: { value: string; label: string }[] })
  | (FieldBase & { type: "ref"; table: string; labelField: string; valueField?: string; orderBy?: string });

export type CrudConfig = {
  table: string;
  titleAr: string;
  fields: Field[];
  listColumns: string[]; // field names displayed in list
  orderBy?: { column: string; ascending?: boolean };
  searchField?: string;
};

function useRefOptions(field: Extract<Field, { type: "ref" }>) {
  return useQuery({
    queryKey: ["ref-options", field.table, field.labelField],
    queryFn: async () => {
      const value = field.valueField ?? "id";
      const { data, error } = await supabase
        .from(field.table as never)
        .select(`${value}, ${field.labelField}`)
        .order(field.orderBy ?? field.labelField, { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Array<Record<string, unknown>>;
    },
  });
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "textarea") {
    return (
      <Textarea
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    );
  }
  if (field.type === "boolean") {
    return (
      <Switch
        checked={Boolean(value)}
        onCheckedChange={(v) => onChange(v)}
      />
    );
  }
  if (field.type === "number") {
    return (
      <Input
        type="number"
        step={field.step ?? "any"}
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      >
        <option value="">—</option>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "ref") {
    return <RefFieldInput field={field} value={value} onChange={onChange} />;
  }
  return (
    <Input
      type={field.type}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
    />
  );
}

function RefFieldInput({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: "ref" }>;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const opts = useRefOptions(field);
  const valueField = field.valueField ?? "id";
  return (
    <select
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      disabled={opts.isLoading}
    >
      <option value="">—</option>
      {(opts.data ?? []).map((row) => (
        <option key={String(row[valueField])} value={String(row[valueField])}>
          {String(row[field.labelField] ?? row[valueField])}
        </option>
      ))}
    </select>
  );
}

function emptyRecord(fields: Field[]): Record<string, unknown> {
  const rec: Record<string, unknown> = {};
  for (const f of fields) {
    rec[f.name] = f.type === "boolean" ? false : null;
  }
  return rec;
}

function normalize(fields: Field[], input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    let v = input[f.name];
    if (v === "" || v === undefined) v = null;
    if (f.type === "boolean") v = Boolean(v);
    if (f.type === "number" && v !== null) v = Number(v);
    out[f.name] = v;
  }
  return out;
}

export function AdminCrud({ config }: { config: CrudConfig }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>(() => emptyRecord(config.fields));

  const listQuery = useQuery({
    queryKey: ["admin-list", config.table, config.orderBy, search, config.searchField],
    queryFn: async () => {
      let q = supabase.from(config.table as never).select("*").limit(500);
      if (config.orderBy) q = q.order(config.orderBy.column, { ascending: config.orderBy.ascending ?? true });
      if (search && config.searchField) q = q.ilike(config.searchField, `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Array<Record<string, unknown>>;
    },
  });

  // Load ref option maps for list rendering (labels instead of raw UUIDs)
  const refFields = useMemo(
    () => config.fields.filter((f): f is Extract<Field, { type: "ref" }> => f.type === "ref"),
    [config.fields],
  );
  const refMapsQuery = useQuery({
    queryKey: ["admin-refmaps", config.table, refFields.map((f) => f.table).join(",")],
    enabled: refFields.length > 0,
    queryFn: async () => {
      const out: Record<string, Record<string, string>> = {};
      for (const f of refFields) {
        const value = f.valueField ?? "id";
        const { data } = await supabase
          .from(f.table as never)
          .select(`${value}, ${f.labelField}`)
          .limit(1000);
        const map: Record<string, string> = {};
        for (const row of (data ?? []) as Array<Record<string, unknown>>) {
          map[String(row[value])] = String(row[f.labelField] ?? "");
        }
        out[f.name] = map;
      }
      return out;
    },
  });

  const upsert = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const clean = normalize(config.fields, payload);
      if (payload.id) {
        const { error } = await supabase
          .from(config.table as never)
          .update(clean as never)
          .eq("id", payload.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(config.table as never).insert(clean as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("تم الحفظ");
      qc.invalidateQueries({ queryKey: ["admin-list", config.table] });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
      setEditing(null);
      setCreating(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(config.table as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["admin-list", config.table] });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setForm(emptyRecord(config.fields));
    setCreating(true);
  };
  const openEdit = (row: Record<string, unknown>) => {
    setForm({ ...row });
    setEditing(row);
  };
  const closeDialogs = () => {
    setCreating(false);
    setEditing(null);
  };

  const dialogOpen = creating || editing !== null;

  const renderCell = (row: Record<string, unknown>, col: string) => {
    const raw = row[col];
    const ref = refFields.find((f) => f.name === col);
    if (ref && refMapsQuery.data) {
      return refMapsQuery.data[col]?.[String(raw)] ?? "—";
    }
    const field = config.fields.find((f) => f.name === col);
    if (field?.type === "boolean") return raw ? "نعم" : "لا";
    if (raw === null || raw === undefined || raw === "") return "—";
    if (typeof raw === "string" && raw.length > 60) return raw.slice(0, 60) + "…";
    if (raw instanceof Object) return JSON.stringify(raw);
    return String(raw);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold flex-1">{config.titleAr}</h1>
        {config.searchField && (
          <Input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
        )}
        <Dialog open={dialogOpen} onOpenChange={(o) => (!o ? closeDialogs() : null)}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>+ إضافة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "تعديل" : "إضافة"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {config.fields.map((f) => (
                <div key={f.name} className="grid gap-1.5">
                  <Label>
                    {f.label} {f.required && <span className="text-destructive">*</span>}
                  </Label>
                  <FieldInput
                    field={f}
                    value={form[f.name]}
                    onChange={(v) => setForm((prev) => ({ ...prev, [f.name]: v }))}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialogs}>
                إلغاء
              </Button>
              <Button
                onClick={() => upsert.mutate(form)}
                disabled={upsert.isPending}
              >
                {upsert.isPending ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {listQuery.isLoading ? (
        <Skeleton className="h-64" />
      ) : listQuery.error ? (
        <p className="text-destructive text-sm">{(listQuery.error as Error).message}</p>
      ) : (listQuery.data ?? []).length === 0 ? (
        <p className="text-muted-foreground text-sm">لا توجد سجلات.</p>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                {config.listColumns.map((c) => {
                  const label = config.fields.find((f) => f.name === c)?.label ?? c;
                  return (
                    <th key={c} className="text-start p-3 font-medium whitespace-nowrap">
                      {label}
                    </th>
                  );
                })}
                <th className="p-3 w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listQuery.data!.map((row) => (
                <tr key={String(row.id)} className="hover:bg-muted/30">
                  {config.listColumns.map((c) => (
                    <td key={c} className="p-3 align-top">
                      {renderCell(row, c)}
                    </td>
                  ))}
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                        تعديل
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove.mutate(String(row.id))}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}