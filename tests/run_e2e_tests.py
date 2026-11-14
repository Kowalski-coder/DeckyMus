#!/usr/bin/env python3
"""
Master E2E Test Runner for DeckyMus Authorization System.
Executes and reports opaque-box test suites across Tiers 1-4:
- Tier 1: Feature Coverage (F1: Yandex, F2: Spotify, F3: VK, F4: Token Removal, F5: Reactive State)
- Tier 2: Boundary & Corner Cases (F1-F5)
- Tier 3: Cross-Feature Combinations (Pairwise & Triad Multi-Service Testing)
- Tier 4: Real-World Workload Scenarios (Smartphones QR, In-App Browser, Unauthenticated UI)
"""

import sys
import os
import time
import argparse
import unittest
from pathlib import Path

# Add project root and vendored modules to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
PY_MODULES = PROJECT_ROOT / "py_modules"

if str(PY_MODULES) not in sys.path:
    sys.path.insert(0, str(PY_MODULES))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Import test classes
from tests.test_yandex_auth import TestYandexAuthTier1, TestYandexAuthTier2
from tests.test_spotify_auth import TestSpotifyAuthTier1, TestSpotifyAuthTier2
from tests.test_vk_auth import TestVkAuthTier1, TestVkAuthTier2
from tests.test_ui_cleanliness_reactive import (
    TestManualTokenRemovalTier1,
    TestManualTokenRemovalTier2,
    TestReactiveStateTransitionTier1,
    TestReactiveStateTransitionTier2,
)
from tests.test_cross_service_combinations import TestCrossServiceCombinationsTier3
from tests.test_real_world_scenarios import TestRealWorldScenariosTier4


TIER_MAP = {
    1: [
        ("Feature 1: Yandex Device Flow (Tier 1)", TestYandexAuthTier1),
        ("Feature 2: Spotify PKCE Flow (Tier 1)", TestSpotifyAuthTier1),
        ("Feature 3: VK OAuth & Helper Flow (Tier 1)", TestVkAuthTier1),
        ("Feature 4: Manual Token Removal (Tier 1)", TestManualTokenRemovalTier1),
        ("Feature 5: Reactive State Transition (Tier 1)", TestReactiveStateTransitionTier1),
    ],
    2: [
        ("Feature 1: Yandex Boundaries & Expiry (Tier 2)", TestYandexAuthTier2),
        ("Feature 2: Spotify Boundaries & Refresh (Tier 2)", TestSpotifyAuthTier2),
        ("Feature 3: VK Boundaries & Relays (Tier 2)", TestVkAuthTier2),
        ("Feature 4: Token Removal Integrity (Tier 2)", TestManualTokenRemovalTier2),
        ("Feature 5: Reactive Concurrency & Recovery (Tier 2)", TestReactiveStateTransitionTier2),
    ],
    3: [
        ("Pairwise & Triad Multi-Service Combinations (Tier 3)", TestCrossServiceCombinationsTier3),
    ],
    4: [
        ("Real-World Workload Scenarios (Tier 4)", TestRealWorldScenariosTier4),
    ],
}


class TierTestResult(unittest.TestResult):
    def __init__(self, verbose=False):
        super().__init__()
        self.verbose = verbose
        self.test_records = []

    def startTest(self, test):
        super().startTest(test)
        self._start_time = time.time()

    def addSuccess(self, test):
        super().addSuccess(test)
        elapsed = time.time() - self._start_time
        self.test_records.append((test, "PASS", elapsed, None))
        if self.verbose:
            print(f"  ✓ {test.shortDescription() or test._testMethodName} ({elapsed:.3f}s)")

    def addFailure(self, test, err):
        super().addFailure(test, err)
        elapsed = time.time() - self._start_time
        self.test_records.append((test, "FAIL", elapsed, err))
        if self.verbose:
            print(f"  ✗ FAIL: {test.shortDescription() or test._testMethodName} ({elapsed:.3f}s)")

    def addError(self, test, err):
        super().addError(test, err)
        elapsed = time.time() - self._start_time
        self.test_records.append((test, "ERROR", elapsed, err))
        if self.verbose:
            print(f"  ⚠ ERROR: {test.shortDescription() or test._testMethodName} ({elapsed:.3f}s)")

    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        elapsed = time.time() - self._start_time
        self.test_records.append((test, "SKIP", elapsed, reason))
        if self.verbose:
            print(f"  - SKIP: {test.shortDescription() or test._testMethodName} ({reason})")


def run_tier(tier_num: int, suites_def, verbose=False):
    loader = unittest.TestLoader()
    combined_suite = unittest.TestSuite()

    for name, test_class in suites_def:
        combined_suite.addTests(loader.loadTestsFromTestCase(test_class))

    print(f"\n{'='*75}")
    print(f"  TIER {tier_num}: {len(combined_suite._tests)} tests")
    print(f"{'='*75}")

    result = TierTestResult(verbose=verbose)
    start_t = time.time()
    combined_suite.run(result)
    total_t = time.time() - start_t

    passes = sum(1 for _, status, _, _ in result.test_records if status == "PASS")
    fails = sum(1 for _, status, _, _ in result.test_records if status == "FAIL")
    errors = sum(1 for _, status, _, _ in result.test_records if status == "ERROR")
    skips = sum(1 for _, status, _, _ in result.test_records if status == "SKIP")

    print(f"\n  Tier {tier_num} Results: {passes} Passed | {fails} Failed | {errors} Errors | {skips} Skipped ({total_t:.2f}s)")

    # Print failure details if any
    if fails > 0 or errors > 0:
        print(f"\n  Failure Details in Tier {tier_num}:")
        for test, status, _, err in result.test_records:
            if status in ("FAIL", "ERROR"):
                print(f"  -------------------------------------------------------------------")
                print(f"  [{status}] {test.id()}")
                if err:
                    import traceback
                    formatted = "".join(traceback.format_exception(*err))
                    lines = formatted.strip().split("\n")
                    for line in lines[-4:]:
                        print(f"    {line}")

    return {
        "tier": tier_num,
        "total": len(result.test_records),
        "passed": passes,
        "failed": fails,
        "errors": errors,
        "skipped": skips,
        "duration": total_t,
        "result": result,
    }


def main():
    parser = argparse.ArgumentParser(description="DeckyMus E2E Test Suite Runner")
    parser.add_argument("--tier", choices=["1", "2", "3", "4", "all"], default="all", help="Execute specific test tier")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose test execution output")
    args = parser.parse_args()

    print("\n" + "#"*75)
    print("  DECKYMUS AUTHORIZATION SYSTEM — E2E TEST SUITE")
    print("  Opaque-Box Requirement-Driven Verification (Tiers 1-4)")
    print("#"*75)

    tiers_to_run = [1, 2, 3, 4] if args.tier == "all" else [int(args.tier)]
    tier_summaries = []

    suite_start = time.time()
    for t in tiers_to_run:
        summary = run_tier(t, TIER_MAP[t], verbose=args.verbose)
        tier_summaries.append(summary)

    total_duration = time.time() - suite_start
    total_tests = sum(s["total"] for s in tier_summaries)
    total_passed = sum(s["passed"] for s in tier_summaries)
    total_failed = sum(s["failed"] for s in tier_summaries)
    total_errors = sum(s["errors"] for s in tier_summaries)
    total_skipped = sum(s["skipped"] for s in tier_summaries)

    # Print Summary Table
    print("\n" + "="*75)
    print("  MASTER TEST SUITE SUMMARY")
    print("="*75)
    print(f"  {'Tier':<10} | {'Total':<8} | {'Passed':<8} | {'Failed':<8} | {'Errors':<8} | {'Skipped':<8}")
    print("  " + "-"*65)
    for s in tier_summaries:
        print(f"  Tier {s['tier']:<5} | {s['total']:<8} | {s['passed']:<8} | {s['failed']:<8} | {s['errors']:<8} | {s['skipped']:<8}")
    print("  " + "-"*65)
    print(f"  {'TOTAL':<10} | {total_tests:<8} | {total_passed:<8} | {total_failed:<8} | {total_errors:<8} | {total_skipped:<8}")
    print("="*75)
    print(f"  Total Suite Duration: {total_duration:.2f}s")
    print("="*75 + "\n")

    if total_failed == 0 and total_errors == 0:
        print("  ✓ ALL TESTS PASSED SUCCESSFULLY! (Exit Code 0)\n")
        sys.exit(0)
    else:
        print(f"  ✗ SUITE FAILED with {total_failed} failures and {total_errors} errors.\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
