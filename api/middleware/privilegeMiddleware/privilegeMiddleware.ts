import {NextRequestHandler} from "@/api/utils/apiRequestWrapper";
import {NextRequest} from "next/server";
import {PrivilegeError, PrivilegeErrorMessage} from "@/api/middleware/privilegeMiddleware/privilegeError";

export const withPrivilegeMiddleware =
    <T>(handler: NextRequestHandler<T>) =>
        async (request: NextRequest, params: T) => {
            try {
                await verifyPrivileges(request);
            } catch (e) {
                throw e instanceof PrivilegeError ? e : new PrivilegeError(PrivilegeErrorMessage.DEFAULT, e);
            }

            return handler(request, params);
        };

const verifyPrivileges = async (request: NextRequest) => {
    // const currentUserData = await authUserService.getUserData();
    // const userPrivileges = currentUserData.privileges;
    // const routeConfig = getRouteConfigForRequest(request);
    // if (!routeConfig) throw new PrivilegeError(PrivilegeErrorMessage.NO_CONFIG);
    // const routeDoesNotRequirePrivilege = routeConfig.privileges.length === 0;
    //
    // const hasPrivilege =
    //     routeDoesNotRequirePrivilege ||
    //     routeConfig.privileges.some((routePrivilege) => userPrivileges.includes(routePrivilege));
    //
    // if (!hasPrivilege) {
    //     throw new PrivilegeError(PrivilegeErrorMessage.DENIED);
    // }
};

// const getRouteConfigForRequest = (request: NextRequest) => {
//     const method = request.method;
//     const path = request.nextUrl.pathname;
//
//     return routeConfig.find((route) => {
//         const escapedPattern = route.path.replace()
//         const regexPattern = escapedPattern.replace(/\*/g, "[^/]*");
//         const regex = new RegExp(`^${regexPattern}`);
//
//         return method === route.method && regex.test(path);
//     })
// }