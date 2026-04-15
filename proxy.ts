import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    const { nextUrl } = req;
    const isLoggedIn = !!session;

    const role = session?.user?.role

    const getHomeByRole = (role?: string | null) => {
        switch (role) {
            case "PROFESOR": return "/profesores";
            case "ALUMNO": return "/alumnos";
            case "INSTITUTION": return "/institution";
            case "ADMIN": return "/admin";
            default: return "/login";
        }
    };

    if (nextUrl.pathname === "/") {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        return NextResponse.redirect(new URL(getHomeByRole(role), req.url));
    }

    if (nextUrl.pathname === "/login" && isLoggedIn) {
        const home = getHomeByRole(role);
        if (home !== "/login") {
            return NextResponse.redirect(new URL(home, req.url));
        }
    }

    const roleRoutes: Record<string, string[]> = {
        PROFESOR: ["/profesores"],
        ALUMNO: ["/alumnos"],
        ADMIN: ["/admin"],
        INSTITUTION: ["/institution"],
    };

    if (isLoggedIn) {
        const roleStr = role as string;
        const allowed = roleRoutes[roleStr] ?? [];
        const isAllowedPath = allowed.some((path) =>
            nextUrl.pathname.startsWith(path)
        );

        if (!isAllowedPath) {
            if (nextUrl.pathname.startsWith("/api") || nextUrl.pathname.includes(".")) {
                return NextResponse.next();
            }

            const home = getHomeByRole(role);

            if (home !== "/login" && !nextUrl.pathname.startsWith(home)) {
                return NextResponse.redirect(new URL(home, req.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};