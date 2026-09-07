import { useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, Ticket, Users } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { validateRegistrationAnswers, validateRegistrationContact } from "@shared/eventRegistration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const steps = ["Tickets", "Your details", "Confirmation"];

type AnswerValue = string | number | boolean;

type Question = {
  id: number;
  fieldKey: string;
  label: string;
  questionType: "text" | "textarea" | "email" | "phone" | "number" | "select" | "checkbox";
  options: string | null;
  isRequired: boolean;
};

function formatEventDate(dateValue: string | Date) {
  const date = new Date(dateValue);
  return date.toLocaleDateString("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function parseOptions(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function StepIndicator({ activeStep, completedStep }: { activeStep: number; completedStep: number }) {
  return (
    <nav aria-label="Event registration progress" className="mb-8">
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = activeStep === stepNumber;
          const isComplete = completedStep >= stepNumber;
          return (
            <li key={step} className="flex min-w-0 items-center gap-2">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`} aria-current={isActive ? "step" : undefined}>
                {isComplete && stepNumber < activeStep ? <Check className="h-4 w-4" aria-hidden="true" /> : stepNumber}
              </div>
              <span className={`hidden truncate text-sm sm:block ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>{step}</span>
              {stepNumber < steps.length && <div className={`hidden h-px flex-1 sm:block ${completedStep >= stepNumber ? "bg-primary" : "bg-border"}`} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function EventSummary({ event, ticketCount }: { event: any; ticketCount: number }) {
  const remaining = event.capacityLimit === null || event.capacityLimit === undefined ? null : Math.max(event.capacityLimit - ticketCount, 0);
  return (
    <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-sm lg:sticky lg:top-28">
      {event.coverImageUrl ? (
        <img src={event.coverImageUrl} alt={`Cover image for ${event.title}`} className="aspect-[16/9] w-full object-cover" />
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-primary/10 text-primary"><CalendarDays className="h-10 w-10" aria-hidden="true" /></div>
      )}
      <CardHeader className="space-y-3 p-5 sm:p-6">
        <p className="text-sm font-medium text-primary">Event registration</p>
        <CardTitle className="text-2xl font-medium tracking-tight">{event.title}</CardTitle>
        {event.description && <CardDescription className="leading-relaxed">{event.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-6 sm:px-6">
        <div className="space-y-3 border-t border-border pt-4 text-sm">
          <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span>{formatEventDate(event.eventDate)}</span></div>
          {(event.startTime || event.endTime) && <div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span>{event.startTime || ""}{event.endTime ? ` – ${event.endTime}` : ""}</span></div>}
          {event.location && <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span>{event.location}</span></div>}
          {event.organiser && <div className="flex items-start gap-3"><Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span>{event.organiser}</span></div>}
        </div>
        {remaining !== null && <p className={`rounded-xl px-3 py-2 text-sm ${remaining > 0 ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"}`}><Ticket className="mr-2 inline h-4 w-4" aria-hidden="true" />{remaining > 0 ? `${remaining} ticket${remaining === 1 ? "" : "s"} remaining` : "This event is full"}</p>}
      </CardContent>
    </Card>
  );
}

export default function EventRegistration() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/convene/register/:id");
  const eventId = Number(params?.id);
  const { data, isLoading, error } = trpc.events.details.useQuery({ id: eventId }, { enabled: Number.isInteger(eventId) && eventId > 0 });
  const [step, setStep] = useState(1);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const registerMutation = trpc.events.register.useMutation({
    onSuccess: () => {
      setStep(3);
      setErrors({});
    },
    onError: (mutationError) => toast.error(mutationError.message || "We could not complete this registration."),
  });

  const questions = (data?.questions ?? []) as Question[];
  const selectedEvent = data?.event;
  const ticketOptions = useMemo(() => {
    const remaining = selectedEvent?.capacityLimit === null || selectedEvent?.capacityLimit === undefined ? 10 : Math.min(10, Math.max(selectedEvent.capacityLimit - (data?.ticketCount ?? 0), 0));
    return Array.from({ length: remaining }, (_, index) => index + 1);
  }, [selectedEvent?.capacityLimit, data?.ticketCount]);

  if (isLoading) return <div className="container px-4 py-16"><div className="mx-auto max-w-5xl animate-pulse space-y-6"><div className="h-10 w-2/3 rounded bg-muted" /><div className="h-72 rounded-3xl bg-muted" /></div></div>;
  if (error || !selectedEvent) return <div className="container px-4 py-16"><Card className="mx-auto max-w-xl rounded-3xl border-0 shadow-sm"><CardContent className="space-y-4 p-8 text-center"><h1 className="text-2xl font-medium">Event unavailable</h1><p className="text-muted-foreground">This event could not be found or is no longer available for registration.</p><Button onClick={() => setLocation("/convene")} className="rounded-full">Back to Convene</Button></CardContent></Card></div>;

  const validateContact = () => {
    const nextErrors = validateRegistrationContact(contact);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateQuestions = () => {
    const nextErrors = validateRegistrationAnswers(questions, answers);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateAnswer = (fieldKey: string, value: AnswerValue) => setAnswers((current) => ({ ...current, [fieldKey]: value }));

  const renderQuestion = (question: Question) => {
    const errorMessage = errors[question.fieldKey];
    const fieldId = `question-${question.fieldKey}`;
    const commonLabel = <Label htmlFor={fieldId} className="font-medium">{question.label}{question.isRequired ? " *" : ""}</Label>;
    return <div key={question.id} className="space-y-2">
      {question.questionType === "checkbox" ? <label className="flex items-start gap-3 text-sm"><input id={fieldId} type="checkbox" checked={answers[question.fieldKey] === true} onChange={(event) => updateAnswer(question.fieldKey, event.target.checked)} className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary" /><span>{question.label}{question.isRequired ? " *" : ""}</span></label> : commonLabel}
      {question.questionType === "textarea" && <Textarea id={fieldId} value={String(answers[question.fieldKey] ?? "")} onChange={(event) => updateAnswer(question.fieldKey, event.target.value)} className="rounded-xl" aria-invalid={Boolean(errorMessage)} />}
      {question.questionType === "select" && <Select value={String(answers[question.fieldKey] ?? "")} onValueChange={(value) => updateAnswer(question.fieldKey, value)}><SelectTrigger id={fieldId} className="rounded-xl" aria-invalid={Boolean(errorMessage)}><SelectValue placeholder="Select an option" /></SelectTrigger><SelectContent>{parseOptions(question.options).map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>}
      {question.questionType !== "textarea" && question.questionType !== "select" && question.questionType !== "checkbox" && <Input id={fieldId} type={question.questionType === "number" ? "number" : question.questionType === "email" ? "email" : question.questionType === "phone" ? "tel" : "text"} value={String(answers[question.fieldKey] ?? "")} onChange={(event) => updateAnswer(question.fieldKey, question.questionType === "number" ? Number(event.target.value) : event.target.value)} className="rounded-xl" aria-invalid={Boolean(errorMessage)} />}
      {errorMessage && <p className="text-xs text-destructive" role="alert">{errorMessage}</p>}
    </div>;
  };

  return (
    <div className="bg-muted/30">
      <div className="container px-4 py-8 sm:px-6 sm:py-12">
        <Button variant="ghost" onClick={() => setLocation(`/convene?event=${eventId}`)} className="mb-6 -ml-3 rounded-full"><ArrowLeft className="mr-2 h-4 w-4" />Back to event</Button>
        <div className="grid gap-8 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <EventSummary event={selectedEvent} ticketCount={data?.ticketCount ?? 0} />
          <Card className="rounded-3xl border-0 bg-white shadow-sm">
            <CardContent className="p-5 sm:p-8">
              <StepIndicator activeStep={step} completedStep={step - 1} />
              {step === 1 && <section aria-labelledby="ticket-step-title" className="space-y-6"><div><h1 id="ticket-step-title" className="text-3xl font-medium tracking-tight">Reserve your place</h1><p className="mt-2 text-muted-foreground">Choose how many tickets you would like to reserve for this event.</p></div>{ticketOptions.length === 0 ? <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">This event is currently full.</p> : <div className="space-y-2"><Label htmlFor="ticket-quantity">Number of tickets</Label><Select value={String(ticketQuantity)} onValueChange={(value) => setTicketQuantity(Number(value))}><SelectTrigger id="ticket-quantity" className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{ticketOptions.map((quantity) => <SelectItem key={quantity} value={String(quantity)}>{quantity} ticket{quantity === 1 ? "" : "s"}</SelectItem>)}</SelectContent></Select></div>}<div className="flex justify-end pt-4"><Button onClick={() => setStep(2)} disabled={ticketOptions.length === 0} className="rounded-full">Continue<ArrowRight className="ml-2 h-4 w-4" /></Button></div></section>}
              {step === 2 && <section aria-labelledby="details-step-title" className="space-y-6"><div><h1 id="details-step-title" className="text-3xl font-medium tracking-tight">Tell us about you</h1><p className="mt-2 text-muted-foreground">We need these details to confirm your registration.</p></div><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="attendee-name">Full name *</Label><Input id="attendee-name" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} className="rounded-xl" aria-invalid={Boolean(errors.name)} />{errors.name && <p className="text-xs text-destructive" role="alert">{errors.name}</p>}</div><div className="space-y-2"><Label htmlFor="attendee-email">Email address *</Label><Input id="attendee-email" type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} className="rounded-xl" aria-invalid={Boolean(errors.email)} />{errors.email && <p className="text-xs text-destructive" role="alert">{errors.email}</p>}</div></div><div className="space-y-2"><Label htmlFor="attendee-phone">Contact number *</Label><Input id="attendee-phone" type="tel" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} className="rounded-xl" aria-invalid={Boolean(errors.phone)} />{errors.phone && <p className="text-xs text-destructive" role="alert">{errors.phone}</p>}</div>{questions.length > 0 && <div className="space-y-5 border-t border-border pt-5"><div><h2 className="text-lg font-medium">Additional questions</h2><p className="text-sm text-muted-foreground">The event organiser has asked for a few more details.</p></div>{questions.map(renderQuestion)}</div>}<div className="flex flex-col-reverse justify-between gap-3 pt-4 sm:flex-row"><Button variant="outline" onClick={() => setStep(1)} className="rounded-full"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button><Button onClick={() => { if (validateContact() && validateQuestions()) setStep(3); }} className="rounded-full">Review registration<ArrowRight className="ml-2 h-4 w-4" /></Button></div></section>}
              {step === 3 && <section aria-labelledby="confirmation-step-title" className="space-y-6"><div><h1 id="confirmation-step-title" className="text-3xl font-medium tracking-tight">Review and confirm</h1><p className="mt-2 text-muted-foreground">Check your details before submitting the registration.</p></div><div className="space-y-3 rounded-2xl bg-muted/60 p-5 text-sm"><div className="flex justify-between gap-4"><span className="text-muted-foreground">Tickets</span><span className="font-medium">{ticketQuantity}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Name</span><span className="text-right font-medium">{contact.name}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Email</span><span className="text-right font-medium">{contact.email}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Contact number</span><span className="text-right font-medium">{contact.phone}</span></div>{questions.map((question) => <div key={question.id} className="flex justify-between gap-4"><span className="text-muted-foreground">{question.label}</span><span className="max-w-[60%] text-right font-medium">{String(answers[question.fieldKey] ?? (question.questionType === "checkbox" ? "No" : "—"))}</span></div>)}</div><div className="flex flex-col-reverse justify-between gap-3 pt-4 sm:flex-row"><Button variant="outline" onClick={() => setStep(2)} className="rounded-full"><ArrowLeft className="mr-2 h-4 w-4" />Edit details</Button><Button onClick={() => registerMutation.mutate({ eventId, name: contact.name, email: contact.email, phone: contact.phone, ticketQuantity, answers })} disabled={registerMutation.isPending} className="rounded-full">{registerMutation.isPending ? "Submitting..." : "Confirm registration"}<Check className="ml-2 h-4 w-4" /></Button></div></section>}
              {step === 3 && registerMutation.isSuccess && <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"><p className="font-medium">You’re registered.</p><p className="mt-1 text-sm">A confirmation has been sent to {contact.email}. We look forward to seeing you at {selectedEvent.title}.</p></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
