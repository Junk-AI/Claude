import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface SocialMediaInputProps {
  register: any;
  watch: any;
  setValue: any;
}

export default function SocialMediaInput({ register, watch, setValue }: SocialMediaInputProps) {
  const socialArray = watch("social") || [];
  const [count, setCount] = useState(Math.max(2, socialArray.length));

  const addSocialHandle = () => {
    setCount(count + 1);
  };

  const removeSocialHandle = (idx: number) => {
    if (count > 0) {
      // Clear the values at this index
      setValue(`social.${idx}.platform`, "");
      setValue(`social.${idx}.handle`, "");
      // Don't actually remove from array, just hide empty ones
      setCount(count - 1);
    }
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
          <Input
            placeholder="Platform (e.g. Instagram)"
            {...register(`social.${idx}.platform`)}
            className="rounded-xl"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Handle/URL"
              {...register(`social.${idx}.handle`)}
              className="rounded-xl flex-1"
            />
            {count > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSocialHandle(idx)}
                className="rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addSocialHandle}
        className="rounded-xl mt-2"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add another social media
      </Button>
    </div>
  );
}
