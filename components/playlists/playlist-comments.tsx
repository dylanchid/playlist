'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, MessageSquare, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  addPlaylistComment,
  deletePlaylistComment,
  getPlaylistComments,
} from '@/app/actions/social'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { PlaylistCommentWithUser } from '@/types/database'

interface PlaylistCommentsProps {
  playlistId: string
  hasContextStory?: boolean
}

export function PlaylistComments({
  playlistId,
  hasContextStory = false,
}: PlaylistCommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<PlaylistCommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [respondsToContext, setRespondsToContext] = useState(hasContextStory)
  const [isPending, startTransition] = useTransition()

  const loadComments = useCallback(async () => {
    setLoading(true)
    const data = await getPlaylistComments(playlistId)
    setComments(data as PlaylistCommentWithUser[])
    setLoading(false)
  }, [playlistId])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Sign in to comment')
      return
    }

    startTransition(async () => {
      try {
        await addPlaylistComment(playlistId, text, respondsToContext)
        setText('')
        toast.success('Comment added')
        await loadComments()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to add comment')
      }
    })
  }

  const handleDelete = (commentId: string) => {
    startTransition(async () => {
      try {
        await deletePlaylistComment(commentId)
        toast.success('Comment removed')
        await loadComments()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete comment')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              hasContextStory
                ? 'Respond to the creator\'s story…'
                : 'Share your thoughts on this playlist…'
            }
            rows={3}
            maxLength={2000}
            disabled={isPending}
          />
          {hasContextStory && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="responds-to-context"
                checked={respondsToContext}
                onCheckedChange={(checked) =>
                  setRespondsToContext(checked === true)
                }
              />
              <Label htmlFor="responds-to-context" className="text-sm">
                This comment responds to the context story
              </Label>
            </div>
          )}
          <Button type="submit" disabled={isPending || !text.trim()}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting…
              </>
            ) : (
              'Post comment'
            )}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Sign in to join the conversation.
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          No comments yet. Be the first to share your take.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const username = comment.user_profiles?.username ?? 'user'
            const isOwn = user?.id === comment.user_id

            return (
              <li
                key={comment.id}
                className="flex gap-3 rounded-lg border p-4 bg-muted/30"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage
                    src={comment.user_profiles?.avatar_url || undefined}
                  />
                  <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">@{username}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {comment.responds_to_context && hasContextStory && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          responds to story
                        </span>
                      )}
                    </div>
                    {isOwn && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleDelete(comment.id)}
                        disabled={isPending}
                        aria-label="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                    {comment.comment_text}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
