import { group, check } from 'k6';
import http from 'k6/http';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
    scenarios: {
        shared: {
            executor: "shared-iterations",
            vus: 1000,
            iterations: 3500,
        },
    },
    thresholds: {
        'http_req_duration': ['avg<2000']
    },
};

export default function () {
    let summary = {};
    group('API Test', function () {
        let res1,res2,id;
        const baseUrl = 'https://reqres.in/api';
        let payload1 = JSON.stringify({
            name: "morpheus",
            job: "leader"
        });
        let payload2 = JSON.stringify({
            name: "morpheus",
            job: "zion resident"
        });

        group('Create API', function () {
            res1 = http.post(`${baseUrl}/users`, payload1, {
                headers: { 'Content-type': 'application/json' }
            });
    
            check(res1, {
                'Response code was 201': (res1) => res1.status === 201,
                'Response body contains user ID': (res1) => JSON.parse(res1.body).hasOwnProperty('id'),
                'Response body contains timestamp created': (res1) => JSON.parse(res1.body).hasOwnProperty('createdAt'),
            });
        });
        
        group('Update API', function(){
            id = JSON.parse(res1.body).id;
            res2 = http.put(`${baseUrl}/users/${id}`, payload2, {
                headers: { 'Content-type': 'application/json' }
            });

            check(res2, {
                'Response code was 200': (res2) => res2.status === 200,
                'Response body contains updated job': (res2) => JSON.parse(res2.body).job === 'zion resident',
                'Response body contains timestamp updated': (res2) => JSON.parse(res2.body).hasOwnProperty('updatedAt'),
            });
        });
    });
    return summary;
}

export function handleSummary(summary) {
    return {
      "summary.html": htmlReport(summary),
    };
}