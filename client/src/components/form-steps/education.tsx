import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { educationItemSchema, type EducationItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Plus, Trash2 } from "lucide-react";

const educationFormSchema = z.object({
  education: z.array(educationItemSchema),
});

type EducationFormData = z.infer<typeof educationFormSchema>;

interface EducationStepProps {
  data: EducationItem[];
  onChange: (data: EducationItem[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function EducationStep({
  data,
  onChange,
  onNext,
  onPrevious,
}: EducationStepProps) {
  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: {
      education: data.length > 0 ? data : [{
        id: crypto.randomUUID(),
        degree: "",
        institution: "",
        location: "",
        startDate: "",
        endDate: "",
        gpa: "",
        description: "",
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const addEducation = () => {
    append({
      id: crypto.randomUUID(),
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    });
  };

  const handleSubmit = (formData: EducationFormData) => {
    onChange(formData.education);
    onNext();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-poppins font-bold text-text-primary mb-2">
          Education
        </h2>
        <p className="text-secondary">
          Add your educational background, starting with your most recent degree.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <Card key={field.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Education {index + 1}
                  </CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`button-remove-education-${index}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Degree and Institution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`education.${index}.degree`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Bachelor of Science in Computer Science" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const currentData = form.getValues().education;
                              onChange(currentData);
                            }}
                            data-testid={`input-degree-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`education.${index}.institution`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="University of Technology" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const currentData = form.getValues().education;
                              onChange(currentData);
                            }}
                            data-testid={`input-institution-${index}`}
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
                  name={`education.${index}.location`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Boston, MA" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const currentData = form.getValues().education;
                            onChange(currentData);
                          }}
                          data-testid={`input-location-${index}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dates and GPA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`education.${index}.startDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input 
                            type="month" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const currentData = form.getValues().education;
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
                    name={`education.${index}.endDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="month" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const currentData = form.getValues().education;
                              onChange(currentData);
                            }}
                            data-testid={`input-end-date-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`education.${index}.gpa`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GPA (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="3.8/4.0" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const currentData = form.getValues().education;
                              onChange(currentData);
                            }}
                            data-testid={`input-gpa-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name={`education.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Relevant coursework, honors, awards, activities..."
                          className="resize-none"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const currentData = form.getValues().education;
                            onChange(currentData);
                          }}
                          data-testid={`textarea-description-${index}`}
                        />
                      </FormControl>
                      <p className="text-xs text-secondary mt-1">
                        Include relevant coursework, honors, awards, or extracurricular activities.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}

          {/* Add Education Button */}
          <Button
            type="button"
            variant="outline"
            onClick={addEducation}
            className="w-full"
            data-testid="button-add-education"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Education
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
  );
}
