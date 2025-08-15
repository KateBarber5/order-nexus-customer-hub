import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Edit, Trash2, Search, Mail } from 'lucide-react';
import CreateUserModal from '@/components/CreateUserModal';
import EditUserModal from '@/components/EditUserModal';

interface User {
  UserGuid: string;
  UserName: string;
  isActive?: boolean;
}

interface OrganizationUsersProps {
  organizationId: number;
  organizationName: string;
  users: User[];
}

const OrganizationUsers = ({ organizationId, organizationName, users }: OrganizationUsersProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  // Local state to manage user active status (mock data)
  const [userStatuses, setUserStatuses] = useState<Record<string, boolean>>(() => {
    const initialStatuses: Record<string, boolean> = {};
    users.forEach(user => {
      initialStatuses[user.UserGuid] = user.isActive !== false; // Default to true if not specified
    });
    return initialStatuses;
  });

  const handleAddUser = () => {
    setCreateUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setEditUserModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleToggleUserStatus = (userGuid: string) => {
    setUserStatuses(prev => {
      const newStatus = !prev[userGuid];
      const userName = users.find(u => u.UserGuid === userGuid)?.UserName || 'User';
      
      toast({
        title: "User Status Updated",
        description: `${userName} has been ${newStatus ? 'activated' : 'deactivated'}.`,
      });
      
      return {
        ...prev,
        [userGuid]: newStatus
      };
    });
  };

  const handleSendPasswordReset = (user: User) => {
    // Mock implementation
    toast({
      title: "Password Reset Email Sent",
      description: `A password reset email has been sent to ${user.UserName}.`,
    });
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // TODO: Implement actual delete API call
      toast({
        title: "User Deleted",
        description: `User ${userToDelete.UserName} has been removed from the organization.`,
      });
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      
      // In a real implementation, you would refresh the user list here
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    searchTerm === '' || 
    user.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.UserGuid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserStatus = (userGuid: string) => {
    return userStatuses[userGuid] ? 'Active' : 'Inactive';
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'Active' ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage users for {organizationName} ({users.length} user{users.length !== 1 ? 's' : ''})
              </CardDescription>
            </div>
            <Button onClick={handleAddUser} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Username/Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.UserGuid}>
                  <TableCell className="font-medium">{user.UserGuid.substring(0, 8)}...</TableCell>
                  <TableCell>{user.UserName || 'No username set'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(getUserStatus(user.UserGuid))}
                      <Switch
                        checked={userStatuses[user.UserGuid]}
                        onCheckedChange={() => handleToggleUserStatus(user.UserGuid)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendPasswordReset(user)}
                        className="h-8 w-8 p-0"
                        title="Send password reset email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditUser(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? 'No users match your search criteria' 
                : 'No users found for this organization'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <CreateUserModal
        open={createUserModalOpen}
        onOpenChange={setCreateUserModalOpen}
        organizationName={organizationName}
        organizationId={organizationId}
      />

      {/* Edit User Modal */}
      <EditUserModal
        open={editUserModalOpen}
        onOpenChange={setEditUserModalOpen}
        user={userToEdit}
        organizationName={organizationName}
        onUserUpdated={() => {
          // In a real implementation, this would refresh the user list
          toast({
            title: "User list updated",
            description: "The user list has been refreshed.",
          });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToDelete?.UserName} from {organizationName}? 
              This action cannot be undone and the user will lose access to the organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrganizationUsers;