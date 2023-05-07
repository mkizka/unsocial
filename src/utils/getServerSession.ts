import { getServerSession as _getServerSession } from "next-auth";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const getServerSession = () => _getServerSession(authOptions);
