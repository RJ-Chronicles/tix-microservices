import request, {Response} from 'supertest';
import { app } from '../../app';

it('should return 200 after sign out', async() => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'valid-password',
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'valid-password',
        })
        .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();

    const res = await request(app)
        .post('/api/users/signout')
        .send({})
        .expect(200);
        const cookie = res.get('Set-Cookie');
        if (cookie) {
            expect(cookie[0]).toEqual('session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly');
        }
});