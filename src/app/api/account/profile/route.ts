import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireUser } from "@/lib/auth/guards";
import { profileSchema } from "@/lib/validators/engagement";
import { updateProfile } from "@/lib/services/account-service";

/** PATCH /api/account/profile – cập nhật họ tên, số điện thoại, đơn vị. */
export const PATCH = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const input = await parseBody(req, profileSchema);
  return ok(await updateProfile(user.id, { name: input.name, phone: input.phone || undefined, organization: input.organization || undefined }));
});
