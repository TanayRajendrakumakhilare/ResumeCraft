import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { experienceItemSchema, type ExperienceItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AIAssistantModal from "@/components/ai-assistant-modal";
import { ChevronRight, ChevronLeft, Plus, Trash2, Wand2 } from "lucide-react";

const experienceFormSchema = z.object({
  experience: z.array(experienceItemSchema),
});

type ExperienceFormData = z.infer<typeof experienceFormSchema>;

interface ExperienceStepProps {
  data: ExperienceItem[];
  onChange: (data: ExperienceItem[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function ExperienceStep({
  data,
  onChange,
  onNext,
  onPrevious,
}: ExperienceStepProps) {
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      experience: data.length > 0 ? data : [{
        id: crypto.randomUUID(),
        jobTitle: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const addExperience = () => {
    append({
      id: crypto.randomUUID(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
  };

  const handleSubmit = (formData: ExperienceFormData) => {
    onChange(formData.experience);
    onNext();
  };

  const handleAIAssist = (index: number) => {
    setSelectedIndex(index);
    setShowAIModal(true);
  };

  const handleAIApply = (content: string) => {
    if (selectedIndex !== null) {
      form.setValue(`experience.${selectedIndex}.description`, content);
      const currentData = form.getValues().experience;
      onChange(currentData);
    }
  };

  return (
    <>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-poppins font-bold text-text-primary mb-2">
            Work Experience
          </h2>
          <p className="text-secondary">
            Add your professional work experience, starting with your most recent position.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Experience {index + 1}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIAssist(index)}
                        className="bg-accent text-white hover:bg-accent/90 border-accent"
                        data-testid={`button-ai-assist-experience-${index}`}
                      >
                        <Wand2 className="h-3 w-3 mr-1" />
                        AI Assist
                      </Button>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-remove-experience-${index}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Job Title and Company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`experience.${index}.jobTitle`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Senior Software Developer" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const currentData = form.getValues().experience;
                                onChange(currentData);
                              }}
                              data-testid={`input-job-title-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Tech Solutions Inc." 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const currentData = form.getValues().experience;
                                onChange(currentData);
                              }}
                              data-testid={`input-company-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name={`experience.${index}.location`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="New York, NY" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const currentData = form.getValues().experience;
                              onChange(currentData);
                            }}
                            data-testid={`input-location-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`experience.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date *</FormLabel>
                          <FormControl>
                            <Input 
                              type="month" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const currentData = form.getValues().experience;
                                onChange(currentData);
                              }}
                              data-testid={`input-start-date-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="month" 
                              disabled={form.watch(`experience.${index}.current`)}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const currentData = form.getValues().experience;
                                onChange(currentData);
                              }}
                              data-testid={`input-end-date-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Current Position */}
                  <FormField
                    control={form.control}
                    name={`experience.${index}.current`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue(`experience.${index}.endDate`, "");
                              }
                              const currentData = form.getValues().experience;
                              onChange(currentData);
                            }}
                            data-testid={`checkbox-current-${index}`}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            I currently work here
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name={`experience.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="• Led development of customer-facing web applications serving 100K+ users&#10;• Implemented CI/CD pipelines reducing deployment time by 60%&#10;• Mentored junior developers and conducted code reviews"
                            className="resize-none"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const currentData = form.getValues().experience;
                              onChange(currentData);
                            }}
                            data-testid={`textarea-description-${index}`}
                          />
                        </FormControl>
                        <p className="text-xs text-secondary mt-1">
                          Use bullet points to describe your key responsibilities and achievements.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}

            {/* Add Experience Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addExperience}
              className="w-full"
              data-testid="button-add-experience"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Experience
            </Button>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={onPrevious}
                data-testid="button-previous"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  data-testid="button-save-draft"
                >
                  Save as Draft
                </Button>
                <Button 
                  type="submit"
                  data-testid="button-continue"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      <AIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        section="experience"
        onApply={handleAIApply}
        initialData={
          selectedIndex !== null
            ? {
                jobTitle: form.watch(`experience.${selectedIndex}.jobTitle`),
                company: form.watch(`experience.${selectedIndex}.company`),
                responsibilities: [],
              }
            : {}
        }
      />
    </>
  );
}
