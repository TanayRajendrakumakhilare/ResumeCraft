import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalDetailsSchema, type PersonalDetails } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import PhotoUpload from "@/components/photo-upload";
import AIAssistantModal from "@/components/ai-assistant-modal";
import { useState } from "react";
import { ChevronRight, Wand2, Linkedin, Github, Globe } from "lucide-react";

interface PersonalDetailsStepProps {
  data: PersonalDetails;
  onChange: (data: PersonalDetails) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function PersonalDetailsStep({
  data,
  onChange,
  onNext,
  onPrevious,
}: PersonalDetailsStepProps) {
  const [showAIModal, setShowAIModal] = useState(false);

  const form = useForm<PersonalDetails>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: data,
  });

  const handleSubmit = (formData: PersonalDetails) => {
    onChange(formData);
    onNext();
  };

  const handleAIApply = (summary: string) => {
    form.setValue("summary", summary);
    onChange({ ...form.getValues(), summary });
  };

  return (
    <>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-poppins font-bold text-text-primary mb-2">
            Personal Details
          </h2>
          <p className="text-secondary">
            Let's start with your basic information to create your professional profile.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <PhotoUpload
              value={form.watch("photoUrl")}
              onChange={(photoUrl) => {
                form.setValue("photoUrl", photoUrl);
                onChange({ ...form.getValues(), photoUrl });
              }}
            />

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="FirstName" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onChange({ ...form.getValues(), firstName: e.target.value });
                        }}
                        data-testid="input-first-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="lastname" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onChange({ ...form.getValues(), lastName: e.target.value });
                        }}
                        data-testid="input-last-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Info */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Your.Personal@email.com" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onChange({ ...form.getValues(), email: e.target.value });
                      }}
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="+1 (555) 123-4567" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onChange({ ...form.getValues(), phone: e.target.value });
                        }}
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="New York, NY" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onChange({ ...form.getValues(), location: e.target.value });
                        }}
                        data-testid="input-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Professional Summary with AI Assistant */}
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Professional Summary</FormLabel>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAIModal(true)}
                      className="bg-accent text-white hover:bg-accent/90"
                      data-testid="button-ai-assist-summary"
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      AI Assist
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Experienced software developer with 5+ years in full-stack development..."
                      className="resize-none"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onChange({ ...form.getValues(), summary: e.target.value });
                      }}
                      data-testid="textarea-summary"
                    />
                  </FormControl>
                  <p className="text-xs text-secondary mt-1">
                    2-3 sentences describing your professional background and career objectives.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Links */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Professional Links
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="linkedIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                          <Input
                            type="url"
                            placeholder="https://linkedin.com/in/"
                            className="pl-10"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onChange({ ...form.getValues(), linkedIn: e.target.value });
                            }}
                            data-testid="input-linkedin"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Profile</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-700" />
                          <Input
                            type="url"
                            placeholder="https://github.com/"
                            className="pl-10"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onChange({ ...form.getValues(), github: e.target.value });
                            }}
                            data-testid="input-github"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio Website</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                          <Input
                            type="url"
                            placeholder="https://Yourname.dev"
                            className="pl-10"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onChange({ ...form.getValues(), portfolio: e.target.value });
                            }}
                            data-testid="input-portfolio"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                disabled
                data-testid="button-previous"
              >
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
        section="summary"
        onApply={handleAIApply}
        initialData={{
          jobTitle: "",
          yearsExperience: "",
          skills: "",
        }}
      />
    </>
  );
}
