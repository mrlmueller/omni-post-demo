"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MessageSquarePlus, Bug, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "../hooks/use-mobile";
import { User } from "firebase/auth";
import { FeatureRequest, BugReport, PostType, PostCategory } from "../components/interfaces/interfaces";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "../lib/firebaseConfig";

// Zod schemas for form validation
const featureRequestSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  area: z.string({
    required_error: "Please select an area.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

const bugReportSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  steps: z.string().min(10, {
    message: "Steps to reproduce must be at least 10 characters.",
  }),
  environment: z.string().min(5, {
    message: "Environment details must be at least 5 characters.",
  }),
});

interface FeedbackFormProps {
  user: User | null;
  t: any;
  setFeedbackItems: React.Dispatch<React.SetStateAction<(FeatureRequest | BugReport)[]>>;
}

export default function FeedbackForm({
  user,
  t,
  setFeedbackItems
}: FeedbackFormProps) {
  const [activeTab, setActiveTab] = useState<PostType>("feature");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const featureForm = useForm<z.infer<typeof featureRequestSchema>>({
    resolver: zodResolver(featureRequestSchema),
    defaultValues: {
      title: "",
      area: "Other", // Default to "Other" category
      description: "",
    },
  });

  const bugForm = useForm<z.infer<typeof bugReportSchema>>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      title: "",
      steps: "",
      environment: "",
    },
  });

  async function onFeatureSubmit(values: z.infer<typeof featureRequestSchema>) {
    if (!user) {
      toast({
        title: "Error",
        description: t.form.notLoggedInToast,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await user.getIdToken();
      const doesUserExistResponse = await fetch("/api/does-user-exist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const { exists } = await doesUserExistResponse.json();

      if (!exists) {
        const redirectUrl = `/create-account-google?token=${encodeURIComponent(
          token
        )}&name=${encodeURIComponent(
          user.displayName || ""
        )}&email=${encodeURIComponent(user.email || "")}`;
        window.location.href = redirectUrl;
        return;
      }

      // Create new feature request
      const baseData = {
        title: values.title,
        description: values.description,
        userId: user.uid,
        userName: user.displayName || "",
        userProfilePic: user.photoURL || "",
        category: values.area as PostCategory,
        type: "feature" as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        upvotes: 0,
        upvotedBy: [],
        status: "requested" as const
      };
      
      const docRef = await addDoc(collection(firestore, "feedback"), baseData);
      
      const newItem = {
        ...baseData,
        id: docRef.id
      };
      
      // Update local state
      setFeedbackItems(prev => [newItem as FeatureRequest, ...prev]);
      toast({
        title: "Success",
        description: t.form.successToast
      });
      
      // Reset form
      featureForm.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: t.form.errorToast,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onBugSubmit(values: z.infer<typeof bugReportSchema>) {
    if (!user) {
      toast({
        title: "Error",
        description: t.form.notLoggedInToast,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await user.getIdToken();
      const doesUserExistResponse = await fetch("/api/does-user-exist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const { exists } = await doesUserExistResponse.json();

      if (!exists) {
        const redirectUrl = `/create-account-google?token=${encodeURIComponent(
          token
        )}&name=${encodeURIComponent(
          user.displayName || ""
        )}&email=${encodeURIComponent(user.email || "")}`;
        window.location.href = redirectUrl;
        return;
      }

      // Create new bug report
      const baseData = {
        title: values.title,
        userId: user.uid,
        userName: user.displayName || "",
        userProfilePic: user.photoURL || "",
        description: "",
        category: "Other" as PostCategory,
        type: "bug" as const,
        stepsToReproduce: values.steps,
        deviceInfo: values.environment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        upvotes: 0,
        upvotedBy: [],
        status: "requested" as const
      };
      
      const docRef = await addDoc(collection(firestore, "feedback"), baseData);
      
      const newItem = {
        ...baseData,
        id: docRef.id
      };
      
      // Update local state
      setFeedbackItems(prev => [newItem as BugReport, ...prev]);
      toast({
        title: "Success",
        description: t.form.successToast
      });
      
      // Reset form
      bugForm.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: t.form.errorToast,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Mobile version
  if (isMobile) {
    return (
      <div className="w-full border rounded-lg shadow-lg bg-card overflow-hidden">
        <div className="border-b p-5">
          <div className="flex items-center">
            <MessageSquarePlus className="h-5 w-5 text-blue-500 mr-3" />
            <h2 className="text-lg font-semibold text-card-foreground">{t.shareForm.title}</h2>
          </div>
        </div>

        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PostType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-none">
            <TabsTrigger
              value="feature"
              className="flex items-center justify-center gap-1 py-3"
            >
              <Lightbulb className="h-4 w-4" />
              <span>{t.shareForm.featureTab}</span>
            </TabsTrigger>
            <TabsTrigger
              value="bug"
              className="flex items-center justify-center gap-1 py-3"
            >
              <Bug className="h-4 w-4" />
              <span>{t.shareForm.bugTab}</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="feature">
              <div className="p-3 bg-blue-50 rounded-lg mb-6 text-sm text-blue-800">
                {t.shareForm.featureIdea}
              </div>

              <Form {...featureForm}>
                <form
                  onSubmit={featureForm.handleSubmit(onFeatureSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={featureForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">{t.shareForm.featureTitle}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.placeholders.featureTitle}
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={featureForm.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">{t.form.categoryLabel}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={t.form.categoryLabel} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SocialMedia">{t.categories.SocialMedia}</SelectItem>
                            <SelectItem value="AppUsage">{t.categories.AppUsage}</SelectItem>
                            <SelectItem value="Connections">{t.categories.Connections}</SelectItem>
                            <SelectItem value="Stats">{t.categories.Stats}</SelectItem>
                            <SelectItem value="Features">{t.categories.Features}</SelectItem>
                            <SelectItem value="Other">{t.categories.Other}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={featureForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">{t.form.descriptionLabel}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.placeholders.featureDescription}
                            className="min-h-32 resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    disabled={isSubmitting}
                  >
                    {t.shareForm.submitFeature}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="bug">
              <div className="p-3 bg-red-50 rounded-lg mb-6 text-sm text-red-800">
                {t.shareForm.bugFound}
              </div>

              <Form {...bugForm}>
                <form
                  onSubmit={bugForm.handleSubmit(onBugSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={bugForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">{t.shareForm.bugTitle}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t.placeholders.bugTitle}
                            className="h-11"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bugForm.control}
                    name="steps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">{t.shareForm.steps}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.placeholders.bugSteps}
                            className="min-h-32 resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bugForm.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">{t.shareForm.environment}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.placeholders.bugEnvironment}
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    disabled={isSubmitting}
                  >
                    {t.shareForm.submitBug}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="w-full mx-auto border rounded-xl shadow-lg bg-card overflow-hidden">
      <div className="border-b p-5 flex items-center">
        <MessageSquarePlus className="h-6 w-6 text-blue-500 mr-3" />
        <h2 className="text-2xl font-semibold text-card-foreground">{t.shareForm.title}</h2>
      </div>
      
      <div className="p-6 md:p-8">
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PostType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md mx-auto">
            <TabsTrigger value="feature" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>{t.types.feature}</span>
            </TabsTrigger>
            <TabsTrigger value="bug" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              <span>{t.types.bug}</span>
            </TabsTrigger>
          </TabsList>

          <div className="max-w-2xl mx-auto">
            <TabsContent value="feature">
              <div className="p-4 bg-blue-50 rounded-lg mb-6 text-sm text-blue-800">
                {t.shareForm.featureIdea}
              </div>

              <Form {...featureForm}>
                <form
                  onSubmit={featureForm.handleSubmit(onFeatureSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={featureForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">{t.shareForm.featureTitle}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t.placeholders.featureTitle}
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={featureForm.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">{t.form.categoryLabel}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder={t.form.categoryLabel} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SocialMedia">
                                {t.categories.SocialMedia}
                              </SelectItem>
                              <SelectItem value="AppUsage">
                                {t.categories.AppUsage}
                              </SelectItem>
                              <SelectItem value="Connections">{t.categories.Connections}</SelectItem>
                              <SelectItem value="Stats">
                                {t.categories.Stats}
                              </SelectItem>
                              <SelectItem value="Features">
                                {t.categories.Features}
                              </SelectItem>
                              <SelectItem value="Other">{t.categories.Other}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={featureForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">{t.form.descriptionLabel}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.placeholders.featureDescription}
                            className="min-h-32 resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {t.shareForm.submitFeature}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="bug">
              <div className="p-4 bg-red-50 rounded-lg mb-6 text-sm text-red-800">
                {t.shareForm.bugFound}
              </div>

              <Form {...bugForm}>
                <form
                  onSubmit={bugForm.handleSubmit(onBugSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={bugForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">{t.shareForm.bugTitle}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t.placeholders.bugTitle}
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bugForm.control}
                    name="steps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">{t.shareForm.steps}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.placeholders.bugSteps}
                            className="min-h-32 resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bugForm.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">{t.shareForm.environment}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.placeholders.bugEnvironment}
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {t.shareForm.submitBug}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}