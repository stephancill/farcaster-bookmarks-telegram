import fetch from "node-fetch"
import { Cast } from "./interfaces/Cast"

export async function resolveCast(uri: string) {
  // Sample uri: farcaster://casts/0x7edd63feca403ffa9d340f4eb8b9bc9175634716a39909c27ec0d9b5aca6626b/0x7edd63feca403ffa9d340f4eb8b9bc9175634716a39909c27ec0d9b5aca6626b
  // farcaster://casts/0x5f820962e0a0e06dca7df5d5888bf02d7fc1d165c36a6f358c4e6c9d290dfb30/0x5f820962e0a0e06dca7df5d5888bf02d7fc1d165c36a6f358c4e6c9d290dfb30
  // https://searchcaster.xyz/api/search?merkleRoot=0x7edd63feca403ffa9d340f4eb8b9bc9175634716a39909c27ec0d9b5aca6626b

  const merkleRoot = uri.split("/").pop()
  const response = await fetch(`https://searchcaster.xyz/api/search?merkleRoot=${merkleRoot}`)
  const json = (await response.json()) as any
  const cast = json?.casts.pop() as Cast

  if (!cast) {
    return "Cast not found"
  }

  const messageComponents = [`<b>${cast.meta.displayName}</b> (<i>${cast.body.username}</i>):`]

  // if replying
  if (cast.meta.replyParentUsername?.username) {
    console.log(cast)
    messageComponents[0] = `<b>${cast.meta.displayName}</b> (<i>${cast.body.username}</i>)\n<i>in reply to ${cast.meta.replyParentUsername.username}</i>:`
  }

  if (cast.body.data.text) {
    messageComponents.push(cast.body.data.text)
  }

  if (cast.body.data.image) {
    messageComponents.push(`${cast.body.data.image}`)
  }

  const searchCasterURL = `<a href="https://searchcaster.xyz/search?merkleRoot=${merkleRoot}">View in browser</a>`
  messageComponents.push(searchCasterURL)

  const message = messageComponents.join("\n\n")

  return message
}
