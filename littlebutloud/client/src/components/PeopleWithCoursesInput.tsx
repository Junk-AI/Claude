import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

interface Person {
  name: string;
  course: string;
}

interface PeopleWithCoursesInputProps {
  control: any;
  register: any;
  setValue: any;
}

export default function PeopleWithCoursesInput({ control, register, setValue }: PeopleWithCoursesInputProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [currentName, setCurrentName] = useState("");
  const [currentCourse, setCurrentCourse] = useState("");

  const addPerson = () => {
    if (currentName.trim() && currentCourse.trim()) {
      const newPeople = [...people, { name: currentName, course: currentCourse }];
      setPeople(newPeople);
      setValue("peopleWithCourses", newPeople);
      setCurrentName("");
      setCurrentCourse("");
    }
  };

  const removePerson = (index: number) => {
    const newPeople = people.filter((_, i) => i !== index);
    setPeople(newPeople);
    setValue("peopleWithCourses", newPeople.length > 0 ? newPeople : undefined);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input
          placeholder="Person's name"
          value={currentName}
          onChange={(e) => setCurrentName(e.target.value)}
          className="rounded-xl"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPerson();
            }
          }}
        />
        <Input
          placeholder="Course/Program"
          value={currentCourse}
          onChange={(e) => setCurrentCourse(e.target.value)}
          className="rounded-xl"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPerson();
            }
          }}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addPerson}
        className="rounded-full gap-1"
        disabled={!currentName.trim() || !currentCourse.trim()}
      >
        <Plus className="w-4 h-4" />
        Add Person
      </Button>

      {people.length > 0 && (
        <div className="space-y-2 mt-3 p-3 bg-muted rounded-xl">
          {people.map((person, index) => (
            <div key={index} className="flex items-center justify-between bg-background p-2 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{person.name}</p>
                <p className="text-xs text-muted-foreground">{person.course}</p>
              </div>
              <button
                type="button"
                onClick={() => removePerson(index)}
                className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
