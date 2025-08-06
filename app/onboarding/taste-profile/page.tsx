import { TasteProfileForm } from '@/components/onboarding/taste-profile-form';

export default function TasteProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl">
        <TasteProfileForm />
      </div>
    </div>
  );
} 