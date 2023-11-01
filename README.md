# Useful things

```
  create table order_num (
    store_id int not null,
    order_number int not null,
    primary key (sotre_id)
  )
```

# Benchmarks:

This benchmarks were produced running on localhost (no network latency), using a single thread for processing the requests

```
Finished 1000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8989

Document Path:          /nextOrderNumber/13
Document Length:        4 bytes

Concurrency Level:      3
Time taken for tests:   2.675 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      209000 bytes
HTML transferred:       4000 bytes
Requests per second:    373.80 [#/sec] (mean)
Time per request:       8.026 [ms] (mean)
Time per request:       2.675 [ms] (mean, across all concurrent requests)
Transfer rate:          76.29 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       1
Processing:     6    8   2.6      7      24
Waiting:        6    8   2.6      7      24
Total:          6    8   2.6      7      24

Percentage of the requests served within a certain time (ms)
  50%      7
  66%      8
  75%      8
  80%      8
  90%      9
  95%     10
  98%     21
  99%     22
 100%     24 (longest request)

```
