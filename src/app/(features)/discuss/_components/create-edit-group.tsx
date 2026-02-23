"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  Loader2,
  Users,
  Lock,
  Tag,
  X,
  AlertCircle,
} from "lucide-react";
import {
  useCreateGroup,
  useUpdateGroup,
  useUploadGroupIcon,
  useGroup,
} from "@/services/fastapi/groups";
import { useTags } from "@/services/fastapi/tags";
import Image from "next/image";
import type { TagType, TagResponse } from "@/type/fastapi/tags";
import Loading from "@/components/common/loading";

interface CreateEditGroupProps {
  groupId?: number | null; // null for create mode, number for edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Only allow league tags for groups
const TAG_TYPE_ORDER: TagType[] = ["league"];

const TAG_TYPE_LABELS: Record<TagType, string> = {
  league: "Leagues",
  team: "Teams",
  player: "Players",
  topic: "Topics",
};

export default function CreateEditGroup({
  groupId = null,
  onSuccess,
  onCancel,
}: CreateEditGroupProps) {
  const router = useRouter();
  const isEditMode = groupId !== null && groupId !== undefined;

  // Fetch group data if in edit mode
  const { data: groupData, isLoading: isLoadingGroup } = useGroup(
    isEditMode ? groupId : null,
  );

  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const uploadIconMutation = useUploadGroupIcon();
  const { data: tagsData, isLoading: tagsLoading } = useTags(100);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group tags by type (only league tags for groups)
  const tagsByType = useMemo(() => {
    const tags = tagsData?.items || [];
    const grouped: Record<TagType, TagResponse[]> = {
      league: [],
      team: [],
      player: [],
      topic: [],
    };

    tags.forEach((tag) => {
      // Only include league tags
      if (tag.type === "league" && grouped[tag.type]) {
        grouped[tag.type].push(tag);
      }
    });

    return grouped;
  }, [tagsData]);

  const handleTagToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  // Initialize form with group data when in edit mode
  useEffect(() => {
    if (isEditMode && groupData) {
      setName(groupData.name || "");
      setDescription(groupData.description || "");
      setIsPrivate(groupData.is_private || false);
      setPreviewUrl(groupData.icon_url || null);
      // Initialize selected tags from group data
      if (groupData.tags && groupData.tags.length > 0) {
        setSelectedTagIds(groupData.tags.map((tag) => tag.id));
      } else {
        setSelectedTagIds([]);
      }
    } else {
      // Reset tags when switching to create mode
      setSelectedTagIds([]);
    }
  }, [isEditMode, groupData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("File must be an image");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl && !groupData?.icon_url) {
      // Only revoke if it's a new preview URL (not the existing icon)
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(
      isEditMode && groupData?.icon_url ? groupData.icon_url : null,
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      if (isEditMode && groupId) {
        // Update group
        const updateData: {
          name?: string;
          description?: string | null;
          is_private?: boolean;
          tag_ids?: number[];
        } = {};

        // Only include fields that have changed
        if (name.trim() !== groupData?.name) {
          updateData.name = name.trim();
        }
        if (description.trim() !== (groupData?.description || "")) {
          updateData.description = description.trim() || null;
        }
        if (isPrivate !== groupData?.is_private) {
          updateData.is_private = isPrivate;
        }

        // Check if tags have changed
        const currentTagIds = groupData?.tags?.map((tag) => tag.id) || [];
        const tagIdsChanged =
          selectedTagIds.length !== currentTagIds.length ||
          !selectedTagIds.every((id) => currentTagIds.includes(id)) ||
          !currentTagIds.every((id) => selectedTagIds.includes(id));

        if (tagIdsChanged) {
          updateData.tag_ids = selectedTagIds;
        }

        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
          await updateGroupMutation.mutateAsync({
            groupId,
            data: updateData,
          });
        }

        // Upload icon if a new file was selected
        if (selectedFile) {
          try {
            await uploadIconMutation.mutateAsync({
              groupId,
              file: selectedFile,
            });
          } catch (iconError) {
            console.error("Failed to upload icon:", iconError);
          }
        }

        // Call success callback or redirect
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/discuss/group-posts/${groupId}`);
        }
      } else {
        // Create group
        const group = await createGroupMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || null,
          icon_url: null, // Icon will be uploaded separately if provided
          is_private: isPrivate,
          tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        });

        // Upload icon if file was selected
        if (selectedFile && group.id) {
          try {
            await uploadIconMutation.mutateAsync({
              groupId: group.id,
              file: selectedFile,
            });
          } catch (iconError) {
            // Group was created but icon upload failed - still redirect
            console.error("Failed to upload icon:", iconError);
          }
        }

        // Call success callback or redirect
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/discuss/group-posts/${group.id}`);
        }
      }
    } catch (error) {
      // Error is handled by mutation state
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} group:`,
        error,
      );
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      if (isEditMode && groupId) {
        router.push(`/discuss/group-posts/${groupId}`);
      } else {
        router.push("/discuss");
      }
    }
  };

  const isSubmitting =
    createGroupMutation.isPending ||
    updateGroupMutation.isPending ||
    uploadIconMutation.isPending;

  // Show loading state while fetching group data in edit mode
  if (isEditMode && isLoadingGroup) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  // Show error if group not found in edit mode
  if (isEditMode && !isLoadingGroup && !groupData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-10 h-10 mx-auto text-red-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Group not found</h3>
          <p className="text-muted-foreground mb-4">
            The group doesn&apos;t exist or you don&apos;t have permission to
            view it.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/discuss")}
            className="mt-2"
          >
            Back to Discussion
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentError = createGroupMutation.error || updateGroupMutation.error;

  return (
    <Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-card/95">
      <CardHeader className="space-y-2 px-6 pb-2 border-b border-border/60">
        <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {isEditMode ? "Edit Group" : "Create New Group"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update your group details and settings"
            : "Start a new community and connect with others"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-3 p-3 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Icon */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Group Icon (Optional)
            </Label>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
              {previewUrl ? (
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-4 ring-primary/20 ring-offset-2 ring-offset-background shadow-lg">
                    <Image
                      src={previewUrl}
                      alt="Group icon preview"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    className="absolute -top-1 -right-1 h-7 w-7 rounded-full shadow-md hover:scale-110 transition-transform"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary-font/15 to-primary-font/5 border-2 border-border/50 flex items-center justify-center ring-2 ring-offset-2 ring-offset-background ring-transparent">
                  <Users className="w-6 h-6 md:w-7 md:h-7 text-primary-font" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-full text-sm   md:w-auto rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {previewUrl ? "Change Icon" : "Upload Icon"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Max 5MB. Recommended: Square image, 512x512px
                </p>
              </div>
            </div>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label
              htmlFor="group-name"
              className="text-sm font-semibold text-foreground"
            >
              Group Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="group-name"
              type="text"
              placeholder="Enter group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              maxLength={50}
              required
              className="w-full rounded-xl border-2 border-input/50 bg-gradient-to-br from-background to-muted/20 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-200 hover:border-input"
            />
            <p className="text-xs text-muted-foreground px-1">
              {name.length}/50 characters
            </p>
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label
              htmlFor="group-description"
              className="text-sm font-semibold text-foreground"
            >
              Description (Optional)
            </Label>
            <Textarea
              id="group-description"
              placeholder="Describe your group..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              maxLength={1000}
              rows={4}
              className="resize-none rounded-xl border-2 border-input/50 bg-gradient-to-br from-background to-muted/20 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-200 hover:border-input"
            />
            <p className="text-xs text-muted-foreground px-1">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Tag Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Tags (optional)
            </Label>
            <div className="space-y-3">
              {/* Selected tags as chips */}
              {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  {selectedTagIds.map((tagId) => {
                    const tag = Object.values(tagsByType)
                      .flat()
                      .find((t) => t.id === tagId);
                    if (!tag) return null;

                    return (
                      <Button
                        key={tagId}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleTagToggle(tagId)}
                        disabled={isSubmitting}
                        className="h-7 gap-2 text-xs rounded-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/30 text-primary font-medium transition-all duration-200 hover:scale-105"
                      >
                        {tag.name}
                        <X className="h-3 w-3" strokeWidth={2.5} />
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Tag selector dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting || tagsLoading}
                    className="gap-2 rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                  >
                    <Tag className="h-4 w-4" />
                    <span>Add tags</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 max-h-[400px] overflow-y-auto rounded-2xl border-2 shadow-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.2)_transparent]"
                >
                  {TAG_TYPE_ORDER.map((type, index) => {
                    const tags = tagsByType[type];
                    if (tags.length === 0) return null;

                    return (
                      <div key={type}>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="font-semibold">
                            {TAG_TYPE_LABELS[type]}
                          </DropdownMenuLabel>
                          {tags.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.id);
                            return (
                              <DropdownMenuCheckboxItem
                                key={tag.id}
                                checked={isSelected}
                                onCheckedChange={() => handleTagToggle(tag.id)}
                                className="cursor-pointer"
                              >
                                {tag.name}
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                        </DropdownMenuGroup>
                        {index < TAG_TYPE_ORDER.length - 1 && (
                          <DropdownMenuSeparator />
                        )}
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center gap-2 justify-between p-3 md:p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-border/50 hover:border-primary/30 transition-all duration-200">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Label
                  htmlFor="group-private"
                  className="text-sm font-semibold text-foreground cursor-pointer"
                >
                  Private Group
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Only members can view and post in private groups
              </p>
            </div>
            <Switch
              id="group-private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={isSubmitting}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Error Message */}
          {currentError && (
            <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20">
              <p className="text-sm text-destructive font-medium">
                {currentError instanceof Error
                  ? currentError.message
                  : `Failed to ${isEditMode ? "update" : "create"} group. Please try again.`}
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border-2 hover:bg-muted/50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </span>
              ) : isEditMode ? (
                "Update Group"
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
