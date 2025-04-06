
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationId } = await req.json();
    
    if (!applicationId) {
      throw new Error("Application ID is required");
    }
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the application details
    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select(`
        *,
        jobs(task_type, title)
      `)
      .eq("id", applicationId)
      .single();
      
    if (applicationError) throw applicationError;
    if (!application) throw new Error("Application not found");
    
    // Check if an AI review already exists
    const { data: existingReview } = await supabase
      .from("ai_reviews")
      .select("id")
      .eq("application_id", applicationId)
      .maybeSingle();
      
    if (existingReview) {
      return new Response(JSON.stringify({ 
        message: "AI review already exists for this application",
        reviewExists: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Mock AI review data - in a real app, you would call a real AI service here
    const taskType = application.jobs?.task_type?.toLowerCase() || "coding";
    
    // Generate scores based on task type
    let codeQuality = null;
    const overallScore = 3.5 + Math.random() * 1.0; // Generate random score between 3.5-4.5
    
    if (taskType === "coding") {
      codeQuality = {
        correctness: 3.0 + Math.random() * 2.0,
        efficiency: 3.0 + Math.random() * 2.0,
        best_practices: 3.0 + Math.random() * 2.0
      };
    }
    
    const communicationMetrics = taskType === "presentation" ? {
      clarity: 3.0 + Math.random() * 2.0,
      confidence: 3.0 + Math.random() * 2.0,
      content: 3.0 + Math.random() * 2.0
    } : null;
    
    // Generate review data
    const mockAIReview = {
      application_id: applicationId,
      score: parseFloat(overallScore.toFixed(1)),
      summary: "This submission demonstrates solid understanding of key concepts with some areas for improvement.",
      strengths: [
        "Clear approach to problem-solving",
        "Good organization of code/content",
        "Effective implementation of core functionality"
      ],
      areas_to_improve: [
        "Could improve error handling in edge cases",
        "More comprehensive documentation recommended",
        "Consider performance optimizations"
      ],
      code_quality: codeQuality,
      communication: communicationMetrics,
      overall_recommendation: "This candidate shows strong potential and would benefit from focused mentorship in specific areas. Consider advancing to the next stage of evaluation.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the AI review into the database
    const { data: review, error: insertError } = await supabase
      .from("ai_reviews")
      .insert(mockAIReview)
      .select()
      .single();
      
    if (insertError) throw insertError;
    
    // Update the application status to "reviewing"
    await supabase
      .from("applications")
      .update({ status: "reviewing", updated_at: new Date().toISOString() })
      .eq("id", applicationId);
    
    return new Response(JSON.stringify({ 
      message: "AI review generated successfully", 
      review 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating AI review:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
