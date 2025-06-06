"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { UnifiedAuthForm } from "./unified-auth-form";

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function UnifiedAuthModal({ isOpen, onClose, redirectTo }: UnifiedAuthModalProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>('login');
  const { user } = useAuth();

  // Close modal if user is authenticated
  useEffect(() => {
    console.log('🔐 [AUTH_MODAL] Auth state changed:', { 
      hasUser: !!user, 
      userId: user?.id,
      isOpen 
    });
    
    if (user && isOpen) {
      console.log('✅ [AUTH_MODAL] User authenticated, closing modal');
      onClose();
    }
  }, [user, isOpen, onClose]);

  const handleSuccess = () => {
    console.log('🎉 [AUTH_MODAL] Success callback triggered, closing modal');
    onClose();
  };

  const resetForm = () => {
    setCurrentMode('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentMode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription>
            {currentMode === 'signup' 
              ? 'Create a new account to get started' 
              : 'Sign in to your account to continue'
            }
          </DialogDescription>
        </DialogHeader>
        
        <UnifiedAuthForm
          mode={currentMode}
          onModeChange={setCurrentMode}
          redirectTo={redirectTo}
          showSocialAuth={true}
          showModeToggle={true}
          showHeader={false}
          onSuccess={handleSuccess}
          className="border-none"
        />
      </DialogContent>
    </Dialog>
  );
} 