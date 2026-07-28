"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MessageSquarePlus, Bug, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useMediaQuery } from "@/app/hooks/use-mobile";

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

export default function FeedbackForm() {
  const [activeTab, setActiveTab] = useState("feature");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const featureForm = useForm<z.infer<typeof featureRequestSchema>>({
    resolver: zodResolver(featureRequestSchema),
    defaultValues: {
      title: "",
      area: "",
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

  function onFeatureSubmit(values: z.infer<typeof featureRequestSchema>) {
    console.log("Feature request submitted:", values);
    // Here you would typically send the data to your API
    featureForm.reset();
    alert("Feature request submitted successfully!");
  }

  function onBugSubmit(values: z.infer<typeof bugReportSchema>) {
    console.log("Bug report submitted:", values);
    // Here you would typically send the data to your API
    bugForm.reset();
    alert("Bug report submitted successfully!");
  }

  // Mobile version
  if (isMobile) {
    return (
      <div className="w-full border rounded-lg overflow-hidden">
        <div className="border-b p-4 bg-white">
          <div className="flex items-center">
            <MessageSquarePlus className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">Share Your Feedback</h2>
          </div>
        </div>

        <Tabs
          defaultValue="feature"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-none">
            <TabsTrigger
              value="feature"
              className="flex items-center justify-center gap-1 py-3"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Feature</span>
            </TabsTrigger>
            <TabsTrigger
              value="bug"
              className="flex items-center justify-center gap-1 py-3"
            >
              <Bug className="h-4 w-4" />
              <span>Bug</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="feature">
              <div className="p-3 bg-purple-50 rounded-lg mb-4 text-sm text-purple-800">
                Have an idea to make our product better? We'd love to hear it!
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
                        <FormLabel>Feature Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="A short summary of your idea"
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
                        <FormLabel>Product Area</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dashboard">Dashboard</SelectItem>
                            <SelectItem value="analytics">Analytics</SelectItem>
                            <SelectItem value="settings">Settings</SelectItem>
                            <SelectItem value="user-profile">
                              User Profile
                            </SelectItem>
                            <SelectItem value="integrations">
                              Integrations
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your feature idea"
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="bug">
              <div className="p-3 bg-red-50 rounded-lg mb-4 text-sm text-red-800">
                Found something that's not working right? Help us fix it!
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
                        <FormLabel>Bug Title</FormLabel>
                        <FormControl>
                          <Input placeholder="What went wrong?" {...field} />
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
                        <FormLabel>Steps to Reproduce</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Steps to reproduce this bug"
                            className="min-h-20"
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
                        <FormLabel>Environment</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Device, browser, app version"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Submit
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
    <Card className="w-full max-w-[1440px] mx-auto shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <MessageSquarePlus className="h-6 w-6 text-primary mr-2" />
          <CardTitle className="text-xl">Share Your Feedback</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="feature"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md mx-auto">
            <TabsTrigger value="feature" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Feature Request</span>
            </TabsTrigger>
            <TabsTrigger value="bug" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              <span>Bug Report</span>
            </TabsTrigger>
          </TabsList>

          <div className="max-w-2xl mx-auto">
            <TabsContent value="feature">
              <div className="p-4 bg-purple-50 rounded-lg mb-4 text-sm text-purple-800">
                Have an idea to make our product better? We'd love to hear it!
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
                          <FormLabel>Feature Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="A short summary of your feature idea"
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
                          <FormLabel>Product Area</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select area" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dashboard">
                                Dashboard
                              </SelectItem>
                              <SelectItem value="analytics">
                                Analytics
                              </SelectItem>
                              <SelectItem value="settings">Settings</SelectItem>
                              <SelectItem value="user-profile">
                                User Profile
                              </SelectItem>
                              <SelectItem value="integrations">
                                Integrations
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your feature idea"
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">Submit Feature Request</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="bug">
              <div className="p-4 bg-red-50 rounded-lg mb-4 text-sm text-red-800">
                Found something that's not working right? Help us fix it!
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
                        <FormLabel>Bug Title</FormLabel>
                        <FormControl>
                          <Input placeholder="What went wrong?" {...field} />
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
                        <FormLabel>Steps to Reproduce</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Steps to reproduce this bug"
                            className="min-h-20"
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
                        <FormLabel>Environment</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Device, browser, app version"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">Submit Bug Report</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
