"use client";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type Repo = {
  id: string;
  full_name: string;
  html_url: string;
};

const BACKEND_UPLOAD_URL = process.env.NEXT_PUBLIC_AWS_API_GATEWAY || "http://localhost:3000";
const BUCKET_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL || "";

export default function LandingPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const { data: session } = useSession();

  // Fetch user's repos from GitHub
  const fetchRepos = async () => {
    if (!session?.accessToken) return;
    setLoadingRepos(true);
    try {
      const res = await axios.get("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          per_page: 100,
          sort: "updated",
        },
      });
      setRepos(res.data);
    } catch (err) {
      alert("Failed to fetch repositories");
    }
    setLoadingRepos(false);
  };

  // Fetch repos on page load if session is available
  useEffect(() => {
    if (session?.accessToken) {
      fetchRepos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 relative">
      {/* Sign In Button at the top-right */}
      <div className="absolute top-4 right-4">
        <Button variant="outline" onClick={() => signIn("cognito")}>
          Sign In
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">
            Deploy your GitHub Repository
          </CardTitle>
          <CardDescription>
            Enter the URL of your GitHub repository to deploy it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-url">GitHub Repository URL</Label>
              {loadingRepos ? (
                <div>Loading repositories...</div>
              ) : (
                <Select
                  value={repoUrl}
                  onValueChange={(value) => {
                    setRepoUrl(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {repos.map((repo) => (
                      <SelectItem key={repo.id} value={repo.html_url}>
                        {repo.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button
              onClick={async () => {
                setUploading(true);
                console.log(`${BACKEND_UPLOAD_URL}/deploy`);
                const res = await axios.post(`${BACKEND_UPLOAD_URL}/deploy`, {
                  repoUrl: repoUrl
                });

                setUploadId(res.data.id);
                setUploading(false);
                const interval = setInterval(async () => {
                  const response = await axios.get(`${BACKEND_UPLOAD_URL}/status?id=${res.data.id}`);

                  if (response.data.status === "deployed") {
                    clearInterval(interval);
                    setDeployed(true);
                  }
                }, 3000)
              }}
              disabled={uploadId !== "" || uploading}
              className="w-full"
              type="submit"
            >
              {uploadId
                ? `Deploying (${uploadId})`
                : uploading
                  ? "Uploading..."
                  : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {deployed && (
        <Card className="w-full max-w-md mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Deployment Status</CardTitle>
            <CardDescription>
              Your website is successfully deployed!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="deployed-url">Deployed URL</Label>
              <Input
                id="deployed-url"
                readOnly
                type="url"
                value={`${BUCKET_URL}/${uploadId}/index.html`}
              />
            </div>
            <br />
            <Button className="w-full" variant="outline">
              <a
                href={`${BUCKET_URL}/${uploadId}/index.html`}
                target="_blank"
              >
                Visit Website
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
