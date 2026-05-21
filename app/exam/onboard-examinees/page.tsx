"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDepartments } from "@/lib/hooks/use-departments";
import { 
  Building2, 
  ArrowRight, 
  Search, 
  GraduationCap, 
  BookOpen,
  School,
  Ban,
  TriangleAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { GradientTitle } from "@/components/resubale/title";

export default function OnboardExamineesPage() {
  const { data: departments, isLoading, isError } = useDepartments();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDepartments = departments?.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div className="container mx-auto px-4 py-16 flex-grow max-w-6xl">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border text-xs font-semibold text-secondary-foreground uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-primary" />
            Wardheer TVET Portal
          </div>
          <GradientTitle className=" font-serif text-3xl md:text-4xl font-extrabold tracking-tight ">Select Your Department</GradientTitle>
          {/* <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          </h1> */}
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Welcome, Examinee! Please choose your department to verify your student status and access your published exams.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-10 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background pl-10 pr-4 py-5 rounded-lg border-input focus-visible:ring-1 focus-visible:ring-primary transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-card border overflow-hidden">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="items-start max-w-md mx-auto  p-8  text-card-foreground space-y-2">
            <div className=" mx-auto p-3 rounded-full bg-destructive/10 text-destructive">
              <TriangleAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground text-center w-full">Failed to load departments</h3>
            <p className="text-muted-foreground text-sm text-center">
              There was an issue connecting to the portal services. Please refresh the page or try again later.
            </p>
            <Button className="mx-auto" onClick={() => window.location.reload()} variant="outline">
              Retry Connection
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredDepartments?.length === 0 && (
          <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
            <div className="inline-flex p-4 rounded-full bg-muted text-muted-foreground">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No departments found</h3>
            <p className="text-muted-foreground text-sm">
              We couldn't find any departments matching "{searchQuery}". Try adjusting your keywords.
            </p>
          </div>
        )}

        {/* Departments Grid */}
        {!isLoading && !isError && filteredDepartments && filteredDepartments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept) => {
              return (
                <Card key={dept.id} className="bg-card border text-card-foreground hover:border-primary/50 transition-all duration-200 h-full flex flex-col justify-between rounded-xl shadow-xs">

                  <CardContent className="flex-grow flex flex-col justify-between space-y-3 pt-0">
                    {/* image url */}
                    <img width={400} height={400} src={dept.imageUrl || '/departments/it_img.jpeg'} alt={dept.name} className="rounded-md w-full h-48 object-cover" />
                  {/* info */}
                    <div className="flex items-center gap-3 mt-4">
                      <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg font-bold tracking-tight text-foreground ">
                        {dept.name}
                      </CardTitle>
                    </div>
                
                    <p className="text-muted-foreground text-sm  leading-relaxed">
                      {dept.description || "Unlock your creative and technical potential through our dynamic coursework and examinations."}
                    </p>

                    <Link href={`/exam/onboard-examinees/${dept.id}`} className="w-full pt-4">
                      <Button className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold flex items-center justify-center gap-2 py-5 rounded-lg transition-all duration-200 group shadow-xs">
                        Enter Department
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full border-t bg-card py-6">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row justify-between items-center text-muted-foreground text-xs gap-4">
          <div className="flex items-center gap-2 font-medium">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>Wardheer TEVET Student Examination Hub © {new Date().getFullYear()}</span>
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