import { LoaderFunctionArgs } from "react-router-dom";
export const rootLoader = async ({ request }: LoaderFunctionArgs) => {
    const dataResults = await fetch(`https://jsonplaceholder.typicode.com/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (dataResults.ok) {
        const data: Array<Object> = await dataResults.json();
        const users = data.slice(0, 5);
        return { users };
    } else {
        throw new Error("Failed to fetch data");
    }
};
