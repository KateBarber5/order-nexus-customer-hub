
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddCountyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCounty: (name: string) => void;
}

const AddCountyDialog: React.FC<AddCountyDialogProps> = ({
  open,
  onOpenChange,
  onAddCounty
}) => {
  const [countyName, setCountyName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (countyName.trim()) {
      onAddCounty(countyName.trim());
      setCountyName('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setCountyName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New County</DialogTitle>
          <DialogDescription>
            Create a new county to manage municipalities and services.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="county-name">County Name</Label>
              <Input
                id="county-name"
                value={countyName}
                onChange={(e) => setCountyName(e.target.value)}
                placeholder="Enter county name"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!countyName.trim()}>
              Add County
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCountyDialog;
