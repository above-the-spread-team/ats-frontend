"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Upload, Loader2, Users, Lock, Tag, X } from "lucide-react";
import {
  useCreateGroup,
  useUpdateGroup,
  useUploadGroupIcon,
  useGroup,
} from "@/services/fastapi/groups";
import { useTags } from "@/services/fastapi/tags";
import Image from "next/image";
import type { TagType, TagResponse } from "@/type/fastapi/tags";

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
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error if group not found in edit mode
  if (isEditMode && !isLoadingGroup && !groupData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-destructive">Group not found</p>
            <Button
              variant="outline"
              onClick={() => router.push("/discuss")}
              className="mt-4"
            >
              Back to Discussion
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentError = createGroupMutation.error || updateGroupMutation.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">
          {isEditMode ? "Edit Group" : "Create New Group"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="group-name" className="text-sm font-medium">
              Group Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="group-name"
              type="text"
              placeholder="Enter group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              maxLength={100}
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/100 characters
            </p>
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="group-description" className="text-sm font-medium">
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
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Group Icon */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Group Icon (Optional)</Label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border">
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
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">Remove image</span>×
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
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
                  className="w-full md:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {previewUrl ? "Change Icon" : "Upload Icon"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB. Recommended: Square image, 512x512px
                </p>
              </div>
            </div>
          </div>

          {/* Tag Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags (optional)</Label>
            <div className="space-y-2">
              {/* Selected tags as chips */}
              {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
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
                        className="h-7 gap-1.5 text-xs rounded-full"
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
                <DropdownMenuTrigger asChild className="rounded-full">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting || tagsLoading}
                    className="gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    <span>Add tags</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 max-h-[400px] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.2)_transparent]"
                >
                  {TAG_TYPE_ORDER.map((type, index) => {
                    const tags = tagsByType[type];
                    if (tags.length === 0) return null;

                    return (
                      <div key={type}>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>
                            {TAG_TYPE_LABELS[type]}
                          </DropdownMenuLabel>
                          {tags.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.id);
                            return (
                              <DropdownMenuCheckboxItem
                                key={tag.id}
                                checked={isSelected}
                                onCheckedChange={() => handleTagToggle(tag.id)}
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
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="group-private" className="text-sm font-medium">
                  Private Group
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Only members can view and post in private groups
              </p>
            </div>
            <Switch
              id="group-private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {currentError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                {currentError instanceof Error
                  ? currentError.message
                  : `Failed to ${isEditMode ? "update" : "create"} group. Please try again.`}
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
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
