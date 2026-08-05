import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Toolbar, ToolbarHeading, ToolbarPageTitle, ToolbarDescription } from '@/components/layouts/layout-1/components/toolbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullname(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ fullname, email });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
    setIsSaving(false);
  };
  
  return (
    <div className="container space-y-6">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Profile</ToolbarPageTitle>
          <ToolbarDescription>Manage your account settings</ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>
      
      <Card className="p-8 max-w-xl glassmorphism">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <img
              className="size-24 rounded-full border-4 border-background shadow-lg"
              src="/media/avatars/300-2.png"
              alt="User avatar"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input 
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="pt-4 border-t">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
