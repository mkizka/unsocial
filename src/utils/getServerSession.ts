import { getServerSession as _getServerSession } from "next-auth";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

// Stryker disable next-line ArrowFunction
export const getServerSession = () => _getServerSession(authOptions);
