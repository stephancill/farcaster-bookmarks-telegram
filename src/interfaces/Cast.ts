export interface Cast {
  body: {
    publishedAt: number
    username: string
    data: {
      text?: string
      image?: string
      replyParentMerkleRoot?: string
    }
  }
  meta: {
    displayName: string
    replyParentUsername?: {
      username: string
    }
  }
  merkleRoot: string
}
