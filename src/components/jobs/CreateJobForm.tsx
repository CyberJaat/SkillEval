
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

const jobFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string().min(20, "Requirements must be at least 20 characters"),
  task_type: z.string().min(2, "Task type is required"),
  task_instructions: z.string().min(20, "Task instructions must be at least 20 characters"),
  deadline: z.string().min(1, "Deadline is required"),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const CreateJobForm = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: profile?.company || "",
      description: "",
      requirements: "",
      task_type: "coding",
      task_instructions: "",
      deadline: "",
    },
  });

  const onSubmit = async (values: JobFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create a job");
      return;
    }

    try {
      // Split requirements into an array
      const requirementsArray = values.requirements
        .split("\n")
        .map(req => req.trim())
        .filter(req => req.length > 0);

      const { error } = await supabase
        .from("jobs")
        .insert({
          title: values.title,
          company: values.company,
          description: values.description,
          requirements: requirementsArray,
          task_type: values.task_type,
          task_instructions: values.task_instructions,
          deadline: new Date(values.deadline).toISOString(),
          recruiter_id: user.id,
          is_active: true,
        });

      if (error) throw error;

      toast.success("Job posted successfully!");
      navigate("/recruiter/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create job");
      console.error("Error creating job:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Frontend Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Tech Company Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the job role, responsibilities, and what you're looking for in a candidate..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the requirements, one per line, e.g.:
- 2+ years of experience with React
- Knowledge of TypeScript
- Excellent communication skills"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="task_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a task type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="coding">Coding Challenge</SelectItem>
                      <SelectItem value="design">Design Challenge</SelectItem>
                      <SelectItem value="writing">Writing Sample</SelectItem>
                      <SelectItem value="problemsolving">Problem Solving</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="task_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed instructions for the task candidates will need to complete during the application..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Post Job
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateJobForm;
