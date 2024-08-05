"use client";
import EditProfileDialog from "@/app/(main)/users/[username]/EditProfileDialog";
import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/types";
import { useState } from "react";

interface EditProfileButtonProps {
  user: UserData;
}

const EditProfileButton = ({ user }: EditProfileButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        Edit Profile
      </Button>
      <EditProfileDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
};

export default EditProfileButton;