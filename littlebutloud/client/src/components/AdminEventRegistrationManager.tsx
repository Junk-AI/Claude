import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const questionTypes = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Contact number" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
] as const;

type QuestionType = typeof questionTypes[number]["value"];
type QuestionDraft = {
  fieldKey: string;
  label: string;
  questionType: QuestionType;
  optionsText: string;
  isRequired: boolean;
  sortOrder: number;
};

function normalizeQuestions(questions: any[]): QuestionDraft[] {
  return questions.map((question, index) => {
    let options: string[] = [];
    try { options = question.options ? JSON.parse(question.options) : []; } catch { options = []; }
    return {
      fieldKey: question.fieldKey,
      label: question.label,
      questionType: question.questionType,
      optionsText: options.join(", "),
      isRequired: Boolean(question.isRequired),
      sortOrder: question.sortOrder ?? index,
    };
  });
}

export default function AdminEventRegistrationManager({ event }: { event: any }) {
  const utils = trpc.useUtils();
  const { data: questions = [], isLoading: questionsLoading } = trpc.events.questions.useQuery({ eventId: event.id });
  const { data: management, isLoading: managementLoading } = trpc.events.management.useQuery({ eventId: event.id });
  const [draftQuestions, setDraftQuestions] = useState<QuestionDraft[]>([]);
  const [capacity, setCapacity] = useState(event.capacityLimit ? String(event.capacityLimit) : "");

  useEffect(() => {
    setDraftQuestions(normalizeQuestions(questions));
  }, [questions]);
  useEffect(() => {
    setCapacity(event.capacityLimit ? String(event.capacityLimit) : "");
  }, [event.capacityLimit]);

  const updateEventMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      toast.success("Event capacity updated");
      utils.events.adminList.invalidate();
      utils.events.upcoming.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const saveQuestionsMutation = trpc.events.saveQuestions.useMutation({
    onSuccess: () => {
      toast.success("Registration questions saved");
      utils.events.questions.invalidate({ eventId: event.id });
      utils.events.details.invalidate({ id: event.id });
    },
    onError: (error) => toast.error(error.message),
  });

  const responseRows = management?.registrations ?? [];
  const registeredTickets = management?.ticketCount ?? 0;
  const capacityNumber = capacity ? Number(capacity) : null;
  const remaining = capacityNumber === null ? null : Math.max(capacityNumber - registeredTickets, 0);
  const responseQuestionColumns = useMemo(() => questions as any[], [questions]);

  const addQuestion = () => {
    const index = draftQuestions.length + 1;
    setDraftQuestions((current) => [...current, { fieldKey: `question_${index}`, label: "", questionType: "text", optionsText: "", isRequired: false, sortOrder: current.length }]);
  };
  const updateQuestion = (index: number, patch: Partial<QuestionDraft>) => setDraftQuestions((current) => current.map((question, questionIndex) => questionIndex === index ? { ...question, ...patch } : question));
  const removeQuestion = (index: number) => setDraftQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index).map((question, questionIndex) => ({ ...question, sortOrder: questionIndex })));
  const save = () => {
    if (capacityNumber !== null && (!Number.isInteger(capacityNumber) || capacityNumber < 1)) {
      toast.error("Capacity must be a positive whole number or left blank for unlimited capacity.");
      return;
    }
    updateEventMutation.mutate({ id: event.id, capacityLimit: capacityNumber });
    saveQuestionsMutation.mutate({
      eventId: event.id,
      questions: draftQuestions.map((question, index) => ({
        fieldKey: question.fieldKey,
        label: question.label,
        questionType: question.questionType,
        options: question.optionsText.split(",").map((option) => option.trim()).filter(Boolean),
        isRequired: question.isRequired,
        sortOrder: index,
      })),
    });
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl border border-border/70 bg-muted/20 shadow-none">
        <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-medium"><Users className="h-5 w-5 text-primary" /> Registration settings</CardTitle>
          <CardDescription>Set capacity and the additional questions attendees see in stage 2. Name, email, and contact number are always required.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-5 pt-2 sm:p-6 sm:pt-2">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end">
            <div className="space-y-2"><Label htmlFor={`capacity-${event.id}`}>Ticket capacity</Label><Input id={`capacity-${event.id}`} type="number" min="1" placeholder="Unlimited" value={capacity} onChange={(inputEvent) => setCapacity(inputEvent.target.value)} className="rounded-xl" /></div>
            <div className="rounded-xl bg-white p-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">{registeredTickets}</span> tickets reserved{capacityNumber !== null && <> · <span className="font-medium text-foreground">{remaining}</span> remaining</>}</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3"><div><h4 className="font-medium">Additional attendee questions</h4><p className="text-xs text-muted-foreground">Examples include dietary needs, organisation, or accessibility requirements.</p></div><Button type="button" size="sm" variant="outline" onClick={addQuestion} className="shrink-0 rounded-full"><Plus className="mr-1 h-4 w-4" />Add question</Button></div>
            {draftQuestions.length === 0 && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No additional questions yet. The required contact fields will still be collected.</p>}
            {draftQuestions.map((question, index) => <div key={`${question.fieldKey}-${index}`} className="grid gap-3 rounded-2xl border border-border bg-white p-4 md:grid-cols-[1fr_1.3fr_160px] md:items-end">
              <div className="space-y-2"><Label htmlFor={`question-label-${event.id}-${index}`}>Question label</Label><Input id={`question-label-${event.id}-${index}`} value={question.label} onChange={(inputEvent) => updateQuestion(index, { label: inputEvent.target.value })} placeholder="e.g. Dietary requirements" className="rounded-xl" /></div>
              <div className="space-y-2"><Label htmlFor={`question-key-${event.id}-${index}`}>Field key</Label><Input id={`question-key-${event.id}-${index}`} value={question.fieldKey} onChange={(inputEvent) => updateQuestion(index, { fieldKey: inputEvent.target.value })} placeholder="dietary_requirements" className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Answer type</Label><Select value={question.questionType} onValueChange={(value) => updateQuestion(index, { questionType: value as QuestionType })}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{questionTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select></div>
              {question.questionType === "select" && <div className="space-y-2 md:col-span-2"><Label htmlFor={`question-options-${event.id}-${index}`}>Dropdown options</Label><Input id={`question-options-${event.id}-${index}`} value={question.optionsText} onChange={(inputEvent) => updateQuestion(index, { optionsText: inputEvent.target.value })} placeholder="Vegetarian, Halal, No preference" className="rounded-xl" /><p className="text-xs text-muted-foreground">Separate options with commas.</p></div>}
              <div className="flex items-center justify-between gap-3 md:col-span-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={question.isRequired} onChange={(inputEvent) => updateQuestion(index, { isRequired: inputEvent.target.checked })} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />Required question</label><Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(index)} className="rounded-full text-destructive hover:text-destructive"><Trash2 className="mr-1 h-4 w-4" />Remove</Button></div>
            </div>)}
          </div>
          <div className="flex justify-end"><Button type="button" onClick={save} disabled={updateEventMutation.isPending || saveQuestionsMutation.isPending} className="rounded-full"><Save className="mr-2 h-4 w-4" />{saveQuestionsMutation.isPending ? "Saving..." : "Save registration settings"}</Button></div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/70 bg-white shadow-none">
        <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3"><CardTitle className="text-lg font-medium">Attendee responses</CardTitle><CardDescription>{managementLoading ? "Loading responses..." : `${responseRows.length} registration${responseRows.length === 1 ? "" : "s"} · ${registeredTickets} ticket${registeredTickets === 1 ? "" : "s"} reserved`}</CardDescription></CardHeader>
        <CardContent className="p-0">
          {responseRows.length === 0 ? <p className="px-5 pb-6 text-sm text-muted-foreground sm:px-6">No registrations yet. Responses will appear here after attendees complete the confirmation stage.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Attendee</th><th className="px-5 py-3 font-medium">Contact</th><th className="px-5 py-3 font-medium">Tickets</th>{responseQuestionColumns.map((question: any) => <th key={question.id} className="px-5 py-3 font-medium">{question.label}</th>)}<th className="px-5 py-3 font-medium">Registered</th></tr></thead><tbody className="divide-y divide-border">{responseRows.map((response: any) => <tr key={response.id} className="align-top"><td className="px-5 py-4"><p className="font-medium">{response.name}</p></td><td className="px-5 py-4"><p>{response.email}</p><p className="text-muted-foreground">{response.phone || "—"}</p></td><td className="px-5 py-4"><Badge variant="secondary" className="rounded-full">{response.ticketQuantity ?? 1}</Badge></td>{responseQuestionColumns.map((question: any) => <td key={question.id} className="max-w-[220px] px-5 py-4">{String(response.answers?.[question.fieldKey] ?? (question.questionType === "checkbox" ? "No" : "—"))}</td>)}<td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{response.createdAt ? new Date(response.createdAt).toLocaleString("en-SG") : "—"}</td></tr>)}</tbody></table></div>}
        </CardContent>
      </Card>
    </div>
  );
}
