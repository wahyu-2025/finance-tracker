import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService, CategoryData } from '@/api/category.service';
import { AxiosErrorResponse } from '@/types';
import { Toolbar, ToolbarHeading, ToolbarPageTitle, ToolbarDescription, ToolbarActions } from '@/components/layouts/layout-1/components/toolbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: CategoryService.getAll
  });

  const categories = categoriesResponse?.data || [];

  const resetForm = () => {
    setName('');
    setType('INCOME');
    setEditingCategory(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: CategoryData) => {
    setEditingCategory(category);
    setName(category.name);
    setType(category.type);
    setIsDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: CategoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      toast.success('Category created successfully');
    },
    onError: (err: AxiosErrorResponse) => {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: CategoryData) => CategoryService.update(data.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      toast.success('Category updated successfully');
    },
    onError: (err: AxiosErrorResponse) => {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: CategoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (err: AxiosErrorResponse) => {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ ...editingCategory, name, type });
    } else {
      createMutation.mutate({ name, type });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Categories</ToolbarPageTitle>
          <ToolbarDescription>Manage your income and expense categories</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </ToolbarActions>
      </Toolbar>

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
                <TableCell colSpan={3} className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">No categories found</TableCell>
              </TableRow>
            ) : (
              categories.map((cat: CategoryData) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cat.type === 'INCOME' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                      {cat.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat)} disabled={cat.user_id === null}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id!)} disabled={cat.user_id === null}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
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
                  onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
