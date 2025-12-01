"use client";

import * as React from "react";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Server,
  Database,
  Heart,
} from "lucide-react";
import FullPage from "@/components/common/full-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TestResult {
  endpoint: string;
  status: "idle" | "loading" | "success" | "error";
  data?: any;
  error?: string;
  responseTime?: number;
}

export default function TestBackendPage() {
  // Get backend URL from environment variable, default to localhost:8000
  const defaultBackendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const [backendUrl, setBackendUrl] = useState(defaultBackendUrl);
  const [results, setResults] = useState<Record<string, TestResult>>({
    root: { endpoint: "/", status: "idle" },
    health: { endpoint: "/health", status: "idle" },
    dbTest: { endpoint: "/db-test", status: "idle" },
  });

  const testEndpoint = async (endpoint: string, key: string) => {
    setResults((prev) => ({
      ...prev,
      [key]: { ...prev[key], status: "loading" },
    }));

    const startTime = Date.now();
    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      if (response.ok) {
        setResults((prev) => ({
          ...prev,
          [key]: {
            endpoint,
            status: "success",
            data,
            responseTime,
          },
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          [key]: {
            endpoint,
            status: "error",
            error: `HTTP ${response.status}: ${response.statusText}`,
            data,
            responseTime,
          },
        }));
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setResults((prev) => ({
        ...prev,
        [key]: {
          endpoint,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to connect to backend",
          responseTime,
        },
      }));
    }
  };

  const testAll = async () => {
    await Promise.all([
      testEndpoint("/", "root"),
      testEndpoint("/health", "health"),
      testEndpoint("/db-test", "dbTest"),
    ]);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "border-green-500/50 bg-green-50 dark:bg-green-950/20";
      case "error":
        return "border-red-500/50 bg-red-50 dark:bg-red-950/20";
      case "loading":
        return "border-primary/50 bg-primary/5";
      default:
        return "";
    }
  };

  return (
    <FullPage center minusHeight={110} className="py-10">
      <div className="w-full max-w-4xl px-4 space-y-6">
        {/* Header */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Backend API Tester
            </CardTitle>
            <CardDescription>
              Test your FastAPI backend endpoints and verify connectivity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backend-url">Backend URL</Label>
              <div className="flex gap-2">
                <Input
                  id="backend-url"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="flex-1"
                />
                <Button onClick={testAll} className="whitespace-nowrap">
                  Test All
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Default: {defaultBackendUrl} (from NEXT_PUBLIC_BACKEND_URL)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Root Endpoint */}
          <Card
            className={`shadow-lg transition-all ${getStatusColor(
              results.root.status
            )}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Root</CardTitle>
                </div>
                {getStatusIcon(results.root.status)}
              </div>
              <CardDescription className="text-xs font-mono">
                GET {results.root.endpoint}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.root.status === "idle" && (
                <p className="text-sm text-muted-foreground">
                  Click to test endpoint
                </p>
              )}
              {results.root.status === "loading" && (
                <p className="text-sm text-muted-foreground">Testing...</p>
              )}
              {results.root.status === "success" && (
                <div className="space-y-1">
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(results.root.data, null, 2)}
                  </pre>
                  {results.root.responseTime && (
                    <p className="text-xs text-muted-foreground">
                      Response time: {results.root.responseTime}ms
                    </p>
                  )}
                </div>
              )}
              {results.root.status === "error" && (
                <div className="space-y-1">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {results.root.error}
                  </p>
                  {results.root.data && (
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(results.root.data, null, 2)}
                    </pre>
                  )}
                  {results.root.responseTime && (
                    <p className="text-xs text-muted-foreground">
                      Failed after: {results.root.responseTime}ms
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => testEndpoint("/", "root")}
                disabled={results.root.status === "loading"}
              >
                Test Endpoint
              </Button>
            </CardFooter>
          </Card>

          {/* Health Endpoint */}
          <Card
            className={`shadow-lg transition-all ${getStatusColor(
              results.health.status
            )}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Health</CardTitle>
                </div>
                {getStatusIcon(results.health.status)}
              </div>
              <CardDescription className="text-xs font-mono">
                GET {results.health.endpoint}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.health.status === "idle" && (
                <p className="text-sm text-muted-foreground">
                  Click to test endpoint
                </p>
              )}
              {results.health.status === "loading" && (
                <p className="text-sm text-muted-foreground">Testing...</p>
              )}
              {results.health.status === "success" && (
                <div className="space-y-1">
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(results.health.data, null, 2)}
                  </pre>
                  {results.health.responseTime && (
                    <p className="text-xs text-muted-foreground">
                      Response time: {results.health.responseTime}ms
                    </p>
                  )}
                </div>
              )}
              {results.health.status === "error" && (
                <div className="space-y-1">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {results.health.error}
                  </p>
                  {results.health.data && (
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(results.health.data, null, 2)}
                    </pre>
                  )}
                  {results.health.responseTime && (
                    <p className="text-xs text-muted-foreground">
                      Failed after: {results.health.responseTime}ms
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => testEndpoint("/health", "health")}
                disabled={results.health.status === "loading"}
              >
                Test Endpoint
              </Button>
            </CardFooter>
          </Card>

          {/* DB Test Endpoint */}
          <Card
            className={`shadow-lg transition-all ${getStatusColor(
              results.dbTest.status
            )}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">DB Test</CardTitle>
                </div>
                {getStatusIcon(results.dbTest.status)}
              </div>
              <CardDescription className="text-xs font-mono">
                GET {results.dbTest.endpoint}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.dbTest.status === "idle" && (
                <p className="text-sm text-muted-foreground">
                  Click to test endpoint
                </p>
              )}
              {results.dbTest.status === "loading" && (
                <p className="text-sm text-muted-foreground">Testing...</p>
              )}
              {results.dbTest.status === "success" && (
                <div className="space-y-1">
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(results.dbTest.data, null, 2)}
                  </pre>
                  {results.dbTest.responseTime && (
                    <p className="text-xs text-muted-foreground">
                      Response time: {results.dbTest.responseTime}ms
                    </p>
                  )}
                </div>
              )}
              {results.dbTest.status === "error" && (
                <div className="space-y-1">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {results.dbTest.error}
                  </p>
                  {results.dbTest.data && (
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(results.dbTest.data, null, 2)}
                    </pre>
                  )}
                  {results.dbTest.responseTime && (
                    <p className="text-xs text-muted-foreground">
                      Failed after: {results.dbTest.responseTime}ms
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => testEndpoint("/db-test", "dbTest")}
                disabled={results.dbTest.status === "loading"}
              >
                Test Endpoint
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold mb-1">
                1. Add Backend URL to .env file:
              </p>
              <pre className="bg-muted p-2 rounded text-xs font-mono">
                NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
              </pre>
              <p className="text-xs text-muted-foreground mt-1">
                For production, use your deployed backend URL
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">
                2. Start your FastAPI backend:
              </p>
              <pre className="bg-muted p-2 rounded text-xs font-mono">
                uvicorn main:app --reload
              </pre>
            </div>
            <div>
              <p className="font-semibold mb-1">3. Test endpoints:</p>
              <p className="text-muted-foreground">
                Click individual "Test Endpoint" buttons or use "Test All" to
                test all endpoints at once.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </FullPage>
  );
}
