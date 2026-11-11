import { useEffect, useState } from "react";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
  ToolbarActions,
} from "@/components/layouts/layout-1/components/toolbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { Edit2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { CatgApiForm, UseCatgApi } from "./api/useCatgApi";
import { CatgList } from "@/types";

export function CategoriesPage() {
  const { getCategory, postCategory, putCategory, deleteCategory } =
    UseCatgApi();
  const isMobile = useIsMobile();
  const [catgList, setCatgList] = useState<CatgList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectCatg, setSelectCatg] = useState<CatgList | null>(null);
  const [editingCategory, setEditingCategory] = useState<CatgList | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [reload, setReload] = useState(0);

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: CatgList) => {
    setEditingCategory(category);
    setSelectCatg(category);
    setName(category.name);
    setType(category.type);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setName("");
    setType("INCOME");
    setEditingCategory(null);
    setSelectCatg(null);
  };
  const triggerReload = () => {
    setReload((prev) => prev + 1);
  };

  const fetchCatgList = async () => {
    setIsLoading(true);
    const response = await getCategory();
    if (response?.status) {
      setCatgList(response.data);
    } else {
      toast.error("Table Gagal dimuat");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCatgList();
  }, [reload]);

  const handleSumbit = async (data: CatgApiForm) => {
    setIsLoading(true);
    try {
      if (editingCategory && selectCatg) {
        const response = await putCategory(selectCatg.id, data);
        if (response?.status) {
          toast.success("Sukses cuyyyy");
          setIsDialogOpen(false);
          triggerReload();
          resetForm();
        } else {
          toast.error("Di cek dulu ada yg belum di isi tuuh");
        }
      } else {
        const response = await postCategory(data);
        if (response?.status) {
          toast.success("Sukses cuyyyy");
          setIsDialogOpen(false);
          triggerReload();
          resetForm();
        } else {
          toast.error("Di cek dulu ada yg belum di isi tuuh");
        }
      }
    } catch (error) {
      toast.error("Cek semua nya dulu cuy ada yg janggal nih");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleted = async (id: number) => {
    try {
      const response = await deleteCategory(id);
      if (response?.status) {
        toast.success("data nya berhasil ilang bro");
        triggerReload();
      } else {
        toast.error(response?.message || "delete gagal bro");
      }
    } catch {
      toast.error("delete gagal bro, cek koneksi lu dulu gih");
    }
  };

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Categories</ToolbarPageTitle>
          <ToolbarDescription>
            Manage your income and expense categories
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </ToolbarActions>
      </Toolbar>

      {isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
              Loading...
            </div>
          ) : catgList.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
              No categories found
            </div>
          ) : (
            catgList.map((cat: CatgList) => (
              <Card key={cat.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-base">{cat.name}</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${cat.type === "INCOME" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}`}
                  >
                    {cat.type}
                  </span>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(cat)}
                    disabled={cat.user_id === null}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleted(cat.id)}
                    disabled={cat.user_id === null}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card className="glassmorphism p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-25">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : catgList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                catgList.map((cat: CatgList) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${cat.type === "INCOME" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}`}
                      >
                        {cat.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(cat)}
                          disabled={cat.user_id === null}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleted(cat.id)}
                          disabled={cat.user_id === null}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSumbit({ name, type });
            }}
          >
            <DialogBody className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Salary, Groceries"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "INCOME" | "EXPENSE")
                  }
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleSumbit({ name, type })}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
