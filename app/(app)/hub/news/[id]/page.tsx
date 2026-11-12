import { PostContainer } from "@/components/modules/hub/reader";

type Props = { params: Promise<{ id: string }> };

export default async function HubPostPage({ params }: Props) {
  const { id } = await params;
  return <PostContainer id={id} />;
}
