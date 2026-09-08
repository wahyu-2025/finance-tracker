import {
  CustomRecapData,
  CustomRecapItem,
  CustomRecapService,
} from "@/api/custom-recap.service";
import { Button } from "@/components/ui/button";
import DialogContent, {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export const CustomRecapFormModal = ({
  open,
  onOpenChange,
  editData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: CustomRecapItem | null;
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CustomRecapData>({
    name: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          name: editData.name,
          start_date: editData.start_date,
          end_date: editData.end_date,
        });
      } else {
        setFormData({ name: "", start_date: "", end_date: "" });
      }
    }
  }, [open, editData]);

  const mutation = useMutation({
    mutationFn: (data: CustomRecapData) =>
      editData
        ? CustomRecapService.update(editData.id, data)
        : CustomRecapService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-recaps"] });
      onOpenChange(false);
      setFormData({ name: "", start_date: "", end_date: "" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Rekap Custom" : "Buat Rekap Custom Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nama Rekap</label>
            <Input
              placeholder="e.g., Liburan Bali"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Mulai Tanggal
              </label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Sampai Tanggal
              </label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
