import { RuleItem } from "async-validator";

export function ipv4(rule: RuleItem, value: string) {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    value
  );
}

export function email(rule: RuleItem, value: string) {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
}

export function url(rule: RuleItem, value: string) {
  return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(
    value
  );
}

export function dnsSubdomain(rule: RuleItem, value: string): boolean {
  return /(^[a-z0-9]$)|(^[a-z0-9][a-z0-9-.]*?[a-z0-9]$)/.test(value);
}

export function rfc1123(rule: RuleItem, value: string): boolean {
  return /(^[a-z0-9]$)|(^[a-z0-9][a-z0-9-]*?[a-z0-9]$)/.test(value);
}

export function rfc1035(rule: RuleItem, value: string): boolean {
  return /(^[a-z]$)|(^[a-z0-9][a-z0-9-]*?[a-z0-9]$)/.test(value)
}
