import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

// ─── Signup Schema ────────────────────────────────────────────────────────────
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone number is required"),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface MemberEventSignupFormProps {
  eventId: number;
  eventName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MemberEventSignupForm({
  eventId,
  eventName,
  onSuccess,
  onCancel,
}: MemberEventSignupFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(signupSchema),
  });

  const signupMutation = trpc.memberEventSignups.create.useMutation({
    onSuccess: () => {
      toast.success("Successfully signed up for the event!");
      reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign up");
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate({
      eventId,
      name: data.name,
      email: data.email,
      phone: data.phone,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus size={20} />
          Sign Up for Event
        </CardTitle>
        <CardDescription>
          {eventName}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit((data: any) => onSubmit(data as SignupFormData))} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-red-600">{String(errors.name?.message)}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-red-600">{String(errors.email?.message)}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter your phone number"
              {...register("phone")}
            />
            {errors.phone && <p className="text-sm text-red-600">{String(errors.phone?.message)}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={signupMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="flex-1"
            >
              {signupMutation.isPending ? "Signing up..." : "Sign Up"}
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center pt-2">
            Your contact information will be shared with the event organizer.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
