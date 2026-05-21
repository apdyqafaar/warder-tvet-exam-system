"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePublishedExams } from "@/lib/hooks/use-published-exams";
import { verifyStudent } from "@/lib/services/student/department.service";
import { 
  UserCheck, 
  ArrowLeft, 
  Clock, 
  HelpCircle, 
  Play, 
  FileText,
  AlertCircle,
  LogOut,
  GraduationCap,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { IStudent } from "@/lib/types/schema-types";
import { Badge } from "@/components/ui/badge";

export default function DepartmentOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;

  const [fullName, setFullName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState<IStudent | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Fetch exams (disabled if not verified, enabled once verified)
  const { data: exams, isLoading: isLoadingExams, isError: isErrorExams } = usePublishedExams(
    verifiedStudent ? departmentId : ""
  );

  // Check if student session is already verified in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wardheer_student_session");
      if (stored) {
        const studentInfo = JSON.parse(stored) as IStudent;
        // Verify the stored student is in the current department
        if (studentInfo.departmentId === departmentId) {
          setVerifiedStudent(studentInfo);
        } else {
          // If department mismatch, clear the mismatched session
          localStorage.removeItem("wardheer_student_session");
        }
      }
    } catch (e) {
      console.error("Error reading student session:", e);
    } finally {
      setIsCheckingSession(false);
    }
  }, [departmentId]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentNumber.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsVerifying(true);
    try {
      const studentData = await verifyStudent(departmentId, fullName, studentNumber);
      
      if (studentData) {
        localStorage.setItem("wardheer_student_session", JSON.stringify(studentData));
        setVerifiedStudent(studentData);
        toast.success(`Verification successful! Welcome, ${studentData.fullName}.`);
      } else {
        toast.error("Invalid student details. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed. Student not found in this department.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("wardheer_student_session");
    setVerifiedStudent(null);
    setFullName("");
    setStudentNumber("");
    toast.info("Logged out from the onboarding portal.");
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="w-48 h-6 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div className="container mx-auto px-4 py-16 flex-grow max-w-4xl">
        {/* Back Button */}
        <Link href="/exam/onboard-examinees" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium mb-8 transition group text-sm">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Departments
        </Link>

        {/* Verification Stage */}
        {!verifiedStudent ? (
          <div className="max-w-md mx-auto">
            <Card className="bg-card border text-card-foreground shadow-md rounded-xl">
              <CardHeader className="space-y-3 pb-6 border-b">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <UserCheck className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Examinee Verification
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                  To access tests, verify your credentials. Your name and number must match your student file in this department.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 pt-8">
                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground font-semibold text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Samatar geelle.."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-background border-input text-foreground placeholder:text-muted-foreground/60 py-5 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentNumber" className="text-foreground font-semibold text-sm">
                      Student Number
                    </Label>
                    <Input
                      id="studentNumber"
                      placeholder="e.g. STU-12345"
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                      className="bg-background border-input text-foreground placeholder:text-muted-foreground/60 py-5 rounded-lg"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary/18 hover:bg-primary/20 text-primary border-primary/40 hover:border-primary/60 cursor-pointer font-semibold py-6 rounded-lg transition-all flex items-center justify-center gap-2"
                    disabled={isVerifying}
                  >
                    {isVerifying ? (  
                      <>
                        <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Verifying details...
                      </>
                    ) : (
                      "Verify Credentials"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Active Exams List Stage */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Student Profile Ribbon */}
            <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border bg-card text-card-foreground gap-4 shadow-sm rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    {verifiedStudent.fullName}
                    <Badge variant={"outline"} className="text-xs text-muted-foreground">
                      Verified Candidate
                    </Badge>
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    ID: {verifiedStudent.studentNumber}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="border border-destructive/50 cursor-p hover:text-destructive transition rounded-lg flex items-center gap-2 text-xs py-5 px-4 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                Switch Student
              </Button>
            </Card>

            {/* Exams Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-4 justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-medium tracking-tight text-foreground/90">Active Examinations</h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-muted border text-xs font-semibold text-muted-foreground">
                  {exams ? `${exams.length} Published` : "Loading..."}
                </span>
              </div>

              {/* Loading State for Exams */}
              {isLoadingExams && (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="bg-card border">
                      <CardContent className="p-6 space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-4 pt-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Error State for Exams */}
              {isErrorExams && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">Failed to retrieve examinations. Please check your network connection.</p>
                </div>
              )}

              {/* Empty State for Exams */}
              {(!isLoadingExams && !isErrorExams && exams?.length === 0 )&& (
                <div className="text-center py-16 p-8 border border-dashed rounded-xl bg-muted/20 space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-muted text-muted-foreground">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">No published exams</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    There are currently no published exams for your department. Please contact your instructor or try reloading the page later.
                  </p>
                </div>
              )}

              {/* Exams Grid */}
              {!isLoadingExams && !isErrorExams && exams && exams.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {exams.map((ex) => (
                    <Card key={ex.id} className="bg-card border text-card-foreground hover:border-primary/40 transition-all duration-200 rounded-xl shadow-xs overflow-hidden">
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                        <div className="space-y-2.5 max-w-xl">
                          <h3 className="text-xl font-bold text-foreground">
                            {ex.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {ex.description || "Take this certified exam to test your skills in the respective course curriculum. Read each question carefully before submitting."}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 pt-1 text-xs font-semibold">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              {ex.duration} Mins
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border">
                              <HelpCircle className="w-3.5 h-3.5 text-primary" />
                              {ex.totalQuestions} Questions
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 w-full md:w-auto">
                          <Link href={`/exam/${departmentId}/${ex.id}`}>
                            <Button className="w-full bg-primary/10 hover:bg-primary/17 text-primary border border-primary/40 hover:border-primary/60 cursor-pointer font-semibold flex items-center justify-center gap-2 py-6 px-6 rounded-lg transition-all shadow-xs">
                              <Play className="w-4 h-4 fill-primary-foreground " />
                              Start Exam
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full border-t bg-card py-6">
        <div className="container mx-auto px-4 max-w-4xl flex flex-col sm:flex-row justify-between items-center text-muted-foreground text-xs gap-4">
          <div className="flex items-center gap-2 font-medium">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>Wardheer TVET Student Examination Hub © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-primary transition cursor-pointer">Terms & Services</span>
             <span className="hover:text-primary transition cursor-pointer">Support and Developed by 'Apdiqafar abdulaahi'</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
